import { reactive } from 'vue';
import router from '@/router/index';

const state = reactive({
  collapsed: true,
  selectedKeys: ['/'],
  openKeys: new Array<string>(),
  items: [
    {
      key: '/',
      //icon: () => h(""),
      label: 'Overview',
      title: 'Overview',
    },
    {
      key: '/accounts',
      //icon: () => h(DesktopOutlined),
      label: 'MyOmniverse',
      title: 'MyOmniverse',
    },
    {
      key: '/tokens',
      //icon: () => h(InboxOutlined),
      label: 'Tokens',
      title: 'Tokens',
    },
    {
      key: '/explorer',
      //icon: () => h(InboxOutlined),
      label: 'Explorer',
      title: 'Explorer',
      onTitleClick: () => {
        //const router = useRouter();
        router.push({
          path: '/explorer/index',
        });
      },
      children: [
        {
          key: '/explorer/index',
          label: 'Index',
          title: 'Index',
        },
        {
          key: '/explorer/blocks',
          label: 'Blocks',
          title: 'Blocks',
        },
        {
          key: '/explorer/transactions',
          label: 'Transactions',
          title: 'Transactions',
        },
        {
          key: '/explorer/batches',
          label: 'Batches',
          title: 'Batches',
        },
      ],
    },
  ],
  setSelectedKey(s: string) {
    this.selectedKeys = [s];
  },
});

export default state;
