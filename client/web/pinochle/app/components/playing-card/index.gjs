import CornerValue from './corner-value';
import FaceValue from './face-value';

<template>
  <li class='playing-card {{@suit}}' ...attributes>
    <button type='button'>
      <span class='sr-only'>{{@value}} of {{@suit}}</span>

      <CornerValue @suit={{@suit}} @value={{@value}} class='top-left' />
      <FaceValue @suit={{@suit}} @value={{@value}} />
      <CornerValue @suit={{@suit}} @value={{@value}} class='bottom-right' />
    </button>
  </li>
</template>
