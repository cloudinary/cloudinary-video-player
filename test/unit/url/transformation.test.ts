import { describe, expect, it } from 'vitest';
import type { Transformation } from '../../../src/core/options/types.js';
import { transformationString } from '../../../src/core/url/transformation.js';

// Expected strings: the transformation part of the v4 URL in test/fixtures/url-parity/source.json
// (after `/upload/`, before the step v4 adds for the source type).
describe('transformationString (v4 url-gen legacy format, fixture tx-* cases)', () => {
  it.each<[string, Transformation, string]>([
    ['tx-object', { fetch_format: 'auto' }, 'f_auto'],
    ['tx-array', [{ fetch_format: 'auto' }, { streaming_profile: 'hd' }], 'f_auto/sp_hd'],
    // v4 puts the named transformation in its own step with the source-type parameters: `f_auto:video,t_test`.
    ['tx-named', 'test', 't_test'],
    ['tx-width-array', [{ width: 400 }], 'w_400'],
    [
      'tx-common-keys',
      {
        width: 640, height: 360, crop: 'fill', gravity: 'auto', quality: 'auto:good', dpr: 2, background: 'blue', angle: 10,
        radius: 20, opacity: 80, border: '3px_solid_black', color: 'red', effect: 'sepia', flags: ['splice', 'awebp'],
        start_offset: 2, end_offset: 8, duration: 6, fps: '15-25', audio_codec: 'aac', bit_rate: '500k', video_sampling: 20,
        overlay: 'cloudinary_icon', x: 10, y: 20, zoom: 1.5, page: 2, density: 72, delay: 20, default_image: 'avatar.png',
        aspect_ratio: '16:9', keyframe_interval: 2, streaming_profile: 'hd',
      },
      'a_10,ac_aac,ar_16:9,b_blue,bo_3px_solid_black,br_500k,c_fill,co_red,d_avatar.png,dl_20,dn_72,dpr_2.0,du_6,e_sepia,eo_8,' +
        'fl_splice.awebp,fps_15-25,g_auto,h_360,ki_2,l_cloudinary_icon,o_80,pg_2,q_auto:good,r_20,so_2,sp_hd,vs_20,w_640,x_10,y_20,z_1.5',
    ],
    // v4 bug kept: an offset array puts the whole array in `so`.
    ['tx-offset-range', { offset: [2.5, 8] }, 'eo_8,so_2.5,8'],
    ['tx-offset-percent', { start_offset: '10p', end_offset: '90p' }, 'eo_90p,so_10p'],
    ['tx-variables', [{ variables: [['$w', 400], ['$h', '$w / 2']] }, { width: '$w', height: '$h', crop: 'fill' }], '$w_400,$h_$w_div_2/c_fill,h_$h,w_$w'],
    ['tx-variable-keys', { $ratio: 'iw / ih', width: '$ratio * 300', crop: 'scale' }, '$ratio_iw_div_ih,c_scale,w_$ratio_mul_300'],
    ['tx-condition', [{ if: 'w_gt_1000' }, { width: 1000, crop: 'scale' }, { if: 'end' }], 'if_w_gt_1000/c_scale,w_1000/if_end'],
    [
      'tx-condition-else',
      [{ if: 'duration > 30' }, { end_offset: 30 }, { if: 'else' }, { effect: 'accelerate:50' }, { if: 'end' }],
      'if_du_gt_30/eo_30/if_else/e_accelerate:50/if_end',
    ],
    ['tx-raw-string', { raw_transformation: 'e_blur:300/l_text:arial_40:Hello' }, 'e_blur:300/l_text:arial_40:Hello'],
    ['tx-raw-and-keys', { width: 300, raw_transformation: 'e_loop:3' }, 'w_300,e_loop:3'],
    [
      'tx-chain-overlay',
      [{ overlay: 'video:dog', width: 200, gravity: 'south_east' }, { flags: 'layer_apply' }],
      'g_south_east,l_video:dog,w_200/fl_layer_apply',
    ],
    [
      'tx-text-overlay',
      [{ overlay: { font_family: 'Arial', font_size: 40, text: 'Hello, World!' }, color: 'white' }, { flags: 'layer_apply', gravity: 'north' }],
      'co_white,l_text:Arial_40:Hello%252C%20World!/fl_layer_apply,g_north',
    ],
    ['codec-vp9-no-type', { video_codec: 'vp9' }, 'vc_vp9'],
    ['codec-object', { video_codec: { codec: 'h264', profile: 'basic', level: '3.1' } }, 'vc_h264:basic:3.1'],
    [
      'resource-image',
      [{ effect: 'ai:model_veo-animate;details_(prompt_!flying bee!)' }, { format: 'auto:video' }],
      'e_ai:model_veo-animate;details_(prompt_!flying_bee!)',
    ],
  ])('%s', (_id, transformation, expected) => {
    expect(transformationString(transformation)).toBe(expected);
  });

  it.each<[string, Transformation]>([
    ['an empty string', ''],
    ['an empty named list', { transformation: [] }],
    ['a digits-only border (an HTML attribute in url-gen)', { border: 5 }],
    ['an empty object', {}],
    ['an empty array', []],
  ])('returns an empty string for %s', (_name, transformation) => {
    expect(transformationString(transformation)).toBe('');
  });
});

// Expected strings checked against url-gen `generateTransformationString` (the v4 serializer).
describe('transformationString (url-gen parity)', () => {
  it.each<[string, Transformation, string]>([
    // How the source builder composes the player step with the user transformation (v4 nesting).
    ['a named transformation joins the player step', { transformation: 'test', fetch_format: 'auto:video' }, 'f_auto:video,t_test'],
    ['named transformations alone join the player step', { transformation: ['a', 'b'], fetch_format: 'auto:video', streaming_profile: 'auto' }, 'f_auto:video,sp_auto,t_a.b'],
    ['user steps come before the player step', { transformation: [{ transformation: [{ fetch_format: 'auto' }], fetch_format: 'auto:video' }] }, 'f_auto/f_auto:video'],
    ['an outer raw transformation is a step of its own', { transformation: [{ fetch_format: 'auto:video' }], raw_transformation: 'vc_vp9' }, 'f_auto:video/vc_vp9'],
    ['a list of names', { transformation: ['a', 'b'] }, 't_a.b'],
    ['a name next to a step is a step of its own', { transformation: [{ width: 1 }, 'named'] }, 'w_1/t_named'],
    ['a string inside a nested list stays raw', { transformation: [[{ width: 100, crop: 'fill' }, 'e_blur']] }, 'c_fill,w_100/e_blur'],
    ['camelCase keys are ignored', { fetchFormat: 'auto', width: 100, crop: 'scale' }, 'c_scale,w_100'],
    ['zero values are kept', { x: 0, opacity: 0, radius: 0, start_offset: 0, angle: 0, dpr: 0 }, 'a_0,dpr_0.0,o_0,r_0,so_0,x_0'],
    ['if, variables, parameters, raw', { if: 'w > 100', width: 10, crop: 'scale', $v: 3, raw_transformation: 'e_blur' }, 'if_w_gt_100,$v_3,c_scale,w_10,e_blur'],
    ['variable keys are sorted, the variables list keeps its order', { $z: 'initial_width', $a: 'aspect_ratio', variables: [['$x', 3]] }, '$a_ar,$z_iw,$x_3'],
    ['expressions', { width: 'w * 2 + 10', crop: 'fill' }, 'c_fill,w_w_mul_2_add_10'],
    ['a condition with predefined variables', { if: 'aspect_ratio >= 1.5 || faceCount > 2' }, 'if_ar_gte_1.5_or_fc_gt_2'],
    ['a condition with a literal string', { if: 'tags != !sale!' }, 'if_tags_ne_!sale!'],
    ['an offset range', { offset: '10%..90%' }, 'eo_90p,so_10p'],
    // v4 bug kept: a string offset without `..` is split into characters.
    ['an offset without a range', { offset: '10' }, 'eo_0,so_1'],
    ['a duration in percent', { duration: '50%' }, 'du_50p'],
    ['size', { size: '100x200', crop: 'fill' }, 'c_fill,h_200,w_100'],
    ['a decimal and an auto dpr', [{ dpr: 1.5 }, { dpr: 'auto' }], 'dpr_1.5/dpr_auto'],
    ['an fps range', { fps: [15, 25] }, 'fps_15-25'],
    ['an effect list', { effect: ['sepia', 50] }, 'e_sepia:50'],
    ['an effect object', { effect: { sepia: 50, blur: 10 } }, 'e_sepia:50,blur:10'],
    ['colors and a border object', { border: { width: 4, color: '#ff0000' }, background: '#fff', color: '#000' }, 'b_rgb:fff,bo_4px_solid_rgb:ff0000,co_rgb:000'],
    ['a codec object without level', { video_codec: { codec: 'h264', profile: 'high' } }, 'vc_h264:high'],
    ['a custom function', { custom_function: { function_type: 'wasm', source: 'example.wasm' } }, 'fn_wasm:example.wasm'],
    ['a remote custom function', { custom_function: { function_type: 'remote', source: 'https://example.com/fn?a=b' } }, 'fn_remote:aHR0cHM6Ly9leGFtcGxlLmNvbS9mbj9hPWI'],
    ['a custom pre-function', { custom_pre_function: { function_type: 'wasm', source: 'example.wasm' } }, 'fn_pre:wasm:example.wasm'],
    ['a fetch layer string', { overlay: 'fetch:https://example.com/a.png' }, 'l_fetch:aHR0cHM6Ly9leGFtcGxlLmNvbS9hLnBuZw=='],
    ['a fetch layer object', { underlay: { url: 'https://example.com/a b.png' } }, 'u_fetch:aHR0cHM6Ly9leGFtcGxlLmNvbS9hJTIwYi5wbmc='],
    ['an image layer in a folder', { overlay: { public_id: 'folder/logo', format: 'png' } }, 'l_folder:logo.png'],
    ['a subtitles layer', { overlay: { resource_type: 'subtitles', public_id: 'sub.srt', font_family: 'arial', font_size: 20 } }, 'l_subtitles:arial_20:sub.srt'],
    ['a text layer with a variable', { overlay: { font_family: 'Arial', font_size: 40, text: 'Hi $(name)!' } }, 'l_text:Arial_40:Hi%20$(name)!'],
    [
      'a text layer with style keywords',
      { overlay: { font_family: 'Arial', font_size: 40, font_weight: 'bold', letter_spacing: 4, text: 'a/b' } },
      'l_text:Arial_40_bold_letter_spacing_4:a%252Fb',
    ],
  ])('%s', (_name, transformation, expected) => {
    expect(transformationString(transformation)).toBe(expected);
  });
});
