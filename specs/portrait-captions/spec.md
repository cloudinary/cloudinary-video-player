# Feature Specification: Captions on portrait players

**Feature Branch**: `fix/portrait-captions`

**Created**: 2026-09-14

**Status**: Approved

**Ticket**: [VIDEO-21222](https://cloudinary.atlassian.net/browse/VIDEO-21222)

**Input**: Gui Jolly's two Slack threads about Tudor's portrait (9:16) training video with
auto-generated captions: default captions render with a huge font, get cut off at the bottom
of the player, and their vertical position jumps from cue to cue. Any font-size override makes
the text float in the middle of the player instead.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Captions stay readable and pinned on a portrait player (Priority: P1)

A viewer watches a 9:16 video on a phone with the default caption styling. Captions are a
sensible size for the player's width, sit at the bottom of the picture, and are never clipped.

**Why this priority**: This is the customer-reported bug; portrait video is the mobile norm.

**Independent Test**: Open the "Portrait (9:16) player" section on the subtitles demo page,
play, and watch several cues of different lengths.

**Acceptance Scenarios**:

1. **Given** a player box taller than it is wide, **When** a cue is shown, **Then** its text
   is fully inside the caption display area (nothing below the bottom edge).
2. **Given** the same player, **When** cues of 1 to 6 lines follow each other, **Then** each
   cue's bottom edge stays at the same distance from the bottom of the display; only the top
   edge moves.
3. **Given** the same player at 390px width, **When** a cue is shown, **Then** the cue font
   size is at most 4% of the player width (today it is ~9%).
4. **Given** a 16:9 player, **When** a cue is shown, **Then** the font size is unchanged from
   today (5% of the display height).

### User Story 2 - Font-size customisation behaves (Priority: P2)

A developer sets `textTracks.options.fontSize` (or page CSS) to make captions smaller or
larger. The caption box follows the text instead of staying at the size measured for the
default font.

**Acceptance Scenarios**:

1. **Given** `fontSize: '50%'`, **When** a cue is shown with bottom gravity, **Then** the text
   sits at the bottom of the display, not floating in the middle of a tall box.
2. **Given** `fontSize: '200%'` with `gravity: 'top'` (the karaoke demo), **When** a cue is
   shown, **Then** the text starts at the top and grows downward without overlapping the
   cue box edge.

### Edge Cases

- `gravity: 'center'` keeps its current behaviour (box centered via `inset: 0; margin: auto`).
- VTT/SRT cues with an explicit `line:` position from the top keep their computed bottom
  edge and grow upward; accepted trade-off, only visible if the text re-wraps.
- Browsers without container-query units (Chrome < 105, Safari < 16, Firefox < 110) keep
  today's font size but still get the content-following box.
- `theme: 'videojs-default'` gets the responsive size and content-following box too; the
  size bug is theme-independent.

## Requirements

- **FR-1** Cue box height follows its content for bottom and top gravity.
- **FR-2** Cue font size is `min(5% of display height, 3.5% of display width)`.
- **FR-2b** Captions do not move when the control-bar shows or hides: the caption area keeps
  its control-bar offset while playing (only `controls: false` players use the smaller offset).
- **FR-3** No change to JS, config schema, or public API. CSS-only in
  `src/assets/styles/components/text-tracks.scss` and
  `src/plugins/styled-text-tracks/styled-text-tracks.scss`.
- **FR-4** Demo page gains a "Portrait (9:16) player" section.
- **FR-5** One Playwright e2e asserts scenarios 1.1 and 1.3 on that section.

## Out of scope

- Embed page (`player.cloudinary.com`) font fallback stack — separate repo.
- iOS webview fullscreen popup / unclickable controls — OS/webview behaviour, needs the
  customer's page URL.
