<template>
  <div class="picture-cropper">
    <div class="header">
      <div class="title">{{ title }}</div>
    </div>
    <VuePictureCropper
      class="cropper"
      :boxStyle="boxStyle"
      :img="request.cdn(editMedia.src)"
      :options="finalOptions"
      :presetMode="presetMode"
      @ready="ready"
    />
    <div class="zoom">
      <a @click="decreaseZoom" style="margin: 0 3px 0 95px; user-select: none">
        <ZoomOutOutlined />
      </a>
      <a-slider class="slider" v-model:value="zoom" :min="0" :max="100" />
      <a @click="increaseZoom" style="margin: 0 95px 0 3px; user-select: none">
        <ZoomInOutlined />
      </a>
    </div>
    <div style="text-align: center">
      <a-button class="button-default" @click="crop"> apply </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons-vue';

import { ref, watch, computed, nextTick } from 'vue';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';
import { message } from 'ant-design-vue';
import request from '@/lib/request/request';
import EditMedia from '@/lib/models/media/edit-media';

const props = defineProps({
  title: { type: String, default: 'Editor Image' },
  editMedia: { type: EditMedia, required: true },
  //img: { type: String, required: true },
  //filename: { type: String, default: "" },
  boxStyle: { type: Object, required: true },
  options: { type: Object, required: true },
  isUploadCrop: { type: Boolean, default: false },
  presetMode: {
    type: Object,
    default: () => {
      return {};
    },
  },
  showCropPreset: { type: Boolean, default: false },
  containerHeight: { type: Number, default: 640 },
  containerWidth: { type: Number, default: 572 },
});

const emit = defineEmits(['crop', 'ready', 'back']);

const zoom = ref(0);
const isReady = ref(false);
const k = ref(0);
const baseZoom = ref(1);
const absoluteZoom = ref(1);
//const presetSelected = ref(1);

watch(
  () => zoom.value,
  (to) => {
    absoluteZoom.value = baseZoom.value + to * k.value;
  },
);

watch(
  () => absoluteZoom.value,
  (to) => {
    if (!cropper) return;
    cropper.zoomTo(to);
    console.log('zoomImage', cropper.getImageData());
  },
);

const finalOptions = computed(() => {
  return { ...props.options };
});

const crop = async () => {
  if (!cropper) return;
  const blob: Blob | null = await cropper.getBlob();
  if (!blob) return;
  const file = await cropper.getFile({
    fileName: 'file',
  });
  if (file) {
    const src = URL.createObjectURL(file);
    const editMedia = new EditMedia(file);
    editMedia.filename = props.editMedia.filename;
    editMedia.src = props.editMedia.src;
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const image = new Image();
      image.onload = async () => {
        editMedia.fileWidth = image.width;
        editMedia.fileHeight = image.height;
        if (props.isUploadCrop) {
          await request.uploadEditMedia(editMedia);
        } else {
          editMedia.editSrc = src;
        }
        emit('crop', editMedia);
      };
      image.onerror = (e) => {
        message.error(request.errMessage(e));
      };
      image.src = src;
    };
  }
};

const resetZoom = () => {
  zoom.value = 0;
};
const increaseZoom = () => {
  if (zoom.value < 100) {
    zoom.value++;
  }
};
const decreaseZoom = () => {
  if (zoom.value > 0) {
    zoom.value--;
  }
};
const setCropRatio = async (cropRatio: number) => {
  if (!cropper) return;
  cropper.reset();
  const imageData = cropper.getImageData();
  cropper.setAspectRatio(cropRatio);
  const containerRatio = props.containerWidth / props.containerHeight;
  const imageRatio = imageData.naturalWidth / imageData.naturalHeight;
  let cropWidth = props.containerWidth;
  let cropHeight = cropWidth / cropRatio;
  if (cropRatio < containerRatio) {
    cropHeight = props.containerHeight;
    cropWidth = cropHeight * cropRatio;
  }
  if (imageRatio <= cropRatio) {
    console.log('imageRatio <= cropRatio');
    console.log('cropWidth:', cropWidth);
    console.log('cropHeight:', cropHeight);
    //image is higher
    baseZoom.value = absoluteZoom.value = 1 / (imageData.naturalWidth / cropWidth);

    k.value =
      imageData.naturalWidth > cropWidth
        ? (absoluteZoom.value * 2) / 100
        : (absoluteZoom.value * 0.2) / 100;
  } else {
    console.log('imageRatio > cropRatio');
    baseZoom.value = absoluteZoom.value = 1 / (imageData.naturalHeight / cropHeight);
    k.value =
      imageData.naturalHeight > cropHeight
        ? (absoluteZoom.value * 2) / 100
        : (absoluteZoom.value * 0.2) / 100;
  }
  resetZoom();
  await nextTick();
  cropper.setCropBoxData({ width: props.containerWidth });
  cropper.setCropBoxData({
    top: props.containerHeight / 2 - cropper.getCropBoxData().height / 2,
  });
};
const ready = async () => {
  console.log('ready');
  isReady.value = true;
  if (cropper) {
    setCropRatio(cropper.getCropBoxData().width / cropper.getCropBoxData().height);
  }
  emit('ready', {});
};
</script>

<style lang="less">
.picture-cropper {
  display: flex;
  flex-direction: column;
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    .title {
      flex-grow: 1;
    }
    .apply {
      height: 40px;
      width: 100px;
      color: #4b4efc;
      border: 1px solid #4b4efc;
      border-radius: 20px;
    }
  }
  .zoom {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    .slider {
      flex-grow: 1;
    }
    .preset {
      width: 150px;
      display: flex;
      gap: 10px;
      justify-content: space-around;
    }
  }
}
</style>
