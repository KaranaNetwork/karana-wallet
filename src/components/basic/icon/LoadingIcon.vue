<template>
  <svg width="50px" height="50px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="40" width="10" height="20" fill="currentColor">
      <animate attributeName="height" values="20;50;20" dur="0.6s" repeatCount="indefinite" />
      <animate attributeName="y" values="40;30;40" dur="0.6s" repeatCount="indefinite" />
    </rect>
    <rect x="40" y="40" width="10" height="20" fill="currentColor">
      <animate
        attributeName="height"
        values="20;50;20"
        dur="0.6s"
        begin="0.2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="40;30;40"
        dur="0.6s"
        begin="0.2s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="60" y="40" width="10" height="20" fill="currentColor">
      <animate
        attributeName="height"
        values="20;50;20"
        dur="0.6s"
        begin="0.4s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="40;30;40"
        dur="0.6s"
        begin="0.4s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="80" y="40" width="10" height="20" fill="currentColor">
      <animate
        attributeName="height"
        values="20;50;20"
        dur="0.6s"
        begin="0.6s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="40;30;40"
        dur="0.6s"
        begin="0.6s"
        repeatCount="indefinite"
      />
    </rect>
  </svg>
</template>
