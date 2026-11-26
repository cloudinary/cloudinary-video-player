// Lint case: @internal names from the packages that export them in Video.js 10.7.0.
import { definePlayerFeature } from '@videojs/core';
import { defineSlice } from '@videojs/store';
export const used = [definePlayerFeature, defineSlice];
