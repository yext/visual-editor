#### 0.0.29 (2025-02-21)

##### Chores

- update semgrep_check.yml to use ubuntu-latest (#231) (e5c273be)

##### New Features

- add breadcrumbs component (#235) (55423b26)
- add link styling section to theme config (#234) (2e6aba07)
- add undo/redo buttons to theme manager (#232) (41fac97e)

##### Bug Fixes

- editor flickers when saving state (#238) (f4486910)

#### 0.0.28 (2025-02-13)

##### New Features

- add page level fields for Title and Description (#225) (c99be212)

#### 0.0.27 (2025-02-13)

##### Bug Fixes

- small grid and flex changes (#230) (67c12e32)

#### 0.0.26 (2025-02-13)

#### 0.0.25 (2025-02-13)

##### Chores

- update to puck 0.18.2 (#228) (7f954fcd)
- update to puck v0.18.1 (#216) (8edf00da)
- update postcss config to esm (#211) (9e95082c)

##### New Features

- further adjust grid and flex components (#224) (72aabe92)
- add weight to card prop (#206) (556fac14)
- add applyAnalytics (#220) (e3840080)
- add analytics ui to theme editor (#219) (2d3ee099)
- update testing starter's theme.config (#215) (c62176d4)
- adjust labels and values for props (#213) (57925f27)
- add theme mode to localDev mode (#210) (6c83779b)
- **deps:** add lz-compression for local storage (#221) (bb0c23bf)

##### Bug Fixes

- prevent re-renders on entity field tooltip toggle (#229) (79428427)
- format phone numbers correctly (#227) (a9080a85)
- update button font size options (#222) (e286359e)
- links open in new tab (#218) (4b72408a)
- update shadcn component registry (#217) (593b9323)
- editor does not load in firefox (#214) (20ee49ab)
- update component registry paths (#212) (fbb61d20)

##### Code Style Changes

- rename manger -> manager (#226) (b281697c)

#### 0.0.24 (2025-01-23)

##### Chores

- upgrade puck to v0.18.0 (#209) (6fff18c3)

##### New Features

- adjust Grid and Flex (#192) (d3ff492d)
- add link type to CTA (#208) (b828558a)
- add localDev mode (#194) (306db499)

#### 0.0.23 (2025-01-22)

##### New Features

- add localDev mode (fd0423be)

#### 0.0.23 (2025-01-22)

##### Chores

- upgrade puck to 0.17.4 (#203) (6dc417c9)

##### New Features

- set up error boundary and send errors to parent (#207) (d978bf58)
- pressing enter creates new item in list (#205) (0a267288)
- normalizeSlug (#191) (aa9778ff)
- address component updates (#196) (ae900fc9)
- set default field for emails component (#197) (cc88bed6)

##### Bug Fixes

- add entity field to get directions component (#204) (2bcf4bd9)
- resolveData stuck when updating footer props (#200) (3db59a55)
- error in constant text fields (#199) (af2a77f4)
- limit font-size for buttons (#198) (588b003d)
- add entity field tooltips to header and footer (#195) (01ec7a86)
- card component fixes (#189) (32d828a7)
- themeSaveState didn't match data from messenger (#190) (7b44d62a)
- entityField Wrapper (#186) (9056af08)
- reset border radius (#187) (c2ee5d3c)
- clear local changes closes on save state update (#188) (29c35f83)
- adjust wording from "templates" to "page sets" (#185) (dcfc7445)

##### Refactors

- banner component updates (#202) (a6a6be7a)
- remove uuid from Header and Footer (#201) (8cc1f39a)
- update constant value field styling (#193) (9333bfbc)

#### 0.0.22 (2025-01-10)

##### Bug Fixes

- undefined header and footer links (#184) (545c4581)

#### 0.0.21 (2025-01-09)

##### New Features

- add Banner component (#182) (d12ba2b9)

##### Refactors

- move pages-components to external peer to enable analytics (#183) (c12dd35c)

#### 0.0.20 (2025-01-03)

##### New Features

- add footer (#180) (570514e0)
- add card component (#177) (8e97f23f)

##### Bug Fixes

- header links fail build (#179) (d29c582f)
- entity field selection (#178) (c6311712)

##### Refactors

- update props for cta and get directions (#181) (f558b2f2)

#### 0.0.19 (2025-01-02)

##### Chores

- update puck and remove unused deps (#176) (5837c249)
- remove resolveVisualEditorData (#171) (b8e5d865)

##### New Features

- add header component (#175) (c76e89f9)

##### Bug Fixes

- font selector does not work with recent puck canaries (#167) (fe05cea4)

##### Refactors

- rename messengers (#173) (4f5612cb)
- read theme from document.\_\_.theme (#174) (0dfeac0f)
- update save state receivers (#172) (7eae66eb)
- custom twMerge and tailwind cleanup (#170) (d2241c46)

#### 0.0.18 (2024-11-21)

##### New Features

- collapse theme sidebar by default (#169) (1b2840d1)

##### Bug Fixes

- rename HoursTable again (#168) (b0ffbd66)

#### 0.0.17 (2024-11-21)

##### Chores

- upgrade puck (#166) (1ca31d13)

##### New Features

- use select for fontSize (#164) (32138590)
- add Promo component (#157) (69af3f70)
- add collapsible theme (#162) (d9037881)
- add theme body font to all components (#159) (1e0d94a6)
- font family selection (#154) (4d789359)
- add constant value support for CTA (#150) (f674a8fd)
- add additional button tw from theme (#151) (e7c75238)
- add border radius props to button (#146) (53c5bd74)
- hoursCard uses hours entity field (#148) (5dad9e72)
- add all components to registry (#145) (a476e399)
- add shadcn cli registry (#138) (b13f4f78)

##### Bug Fixes

- adjust components' exported names (#142) (938c3e30)
- adjust Get Directions component (#165) (f1943a7f)
- rename HoursCard to HoursTable in registry (#163) (d8935908)
- dev mode previews don't match puck iframe (#161) (6bd8d37c)
- dev mode ui state stuck in theme manager (#160) (a5c19f3c)
- adjust Grid components padding (#158) (b6c697e0)
- theme manager dev mode stuck loading (#155) (78ffbb37)
- make theme sidebar padding more consistent (#156) (7eac8887)
- rename HoursCard to HoursTable (#153) (265d5a51)
- hide constant value option if not defined (#152) (eda95977)
- use constantValue if no entity field is selected (#149) (cba1d17b)
- cannot access before initialization error (#147) (966065ee)
- adjust email padding (#144) (458501d4)
- adjust phone component (#143) (6d37d9d1)

#### 0.0.16 (2024-11-07)

##### Chores

- update Puck (9763e7b4)

##### Bug Fixes

- additional components qa (#139) (c0b4392c)
- constant value in GetDirections component (#141) (b7bb846b)

#### 0.0.15 (2024-11-06)

##### New Features

- add fontSize to getDirections (#140) (29e733b4)
- add NumberOrDefaultField (#133) (e06808ed)
- handle siteId in resolveVisualEditorData (#137) (75cbbb63)
- use localStorage when in dev mode (#134) (e7c3fd3a)
- add GetDirections component (#135) (ce63ff99)

##### Bug Fixes

- layout editor no longer requires themeId (#136) (c71255ce)

#### 0.0.14 (2024-11-04)

##### Chores

- update pnpm version (#132) (831da8fb)
- update Puck (43b4b424)

##### New Features

- add coordinate type EntityFieldTypes (#129) (a1d78a5c)
- pass themeData from content to layoutEditor (#130) (c0da8771)
- add visual editor components (#128) (bcdb0ff6)
- correctly support constant values for text lists (#127) (fea00f2c)
- change entity tooltip to just fieldId (#122) (ff30ff56)
- add generic support for constant value (#120) (a7118d2c)
- support address constant values (#119) (0a7a62f3)
- add support for image constant value (#116) (dbbc40e3)
- update getFilteredEntityFields to return lists (#118) (94abcbe5)
- add body text component (#108) (20935966)
- add header text component (#103) (3ddb00d2)
- add Image component (#102) (14d894a7)

##### Bug Fixes

- props QA for GridSection and HoursStatus (#131) (23de363f)
- entity field tooltips mess up css layout (#121) (d9b6fba9)
- formatting of entity fields when used in devMode (#117) (de7337c2)
- adjust colors in header component (#113) (8322fca5)
- header component (#112) (7ab5ced1)
- add label to ImageWrapperComponent (#109) (9a3e87b6)
- preview doesn't update on layout switch (#107) (d3966ec5)
- theme sidebar padding issue (#104) (784ba96f)

##### Refactors

- new theme.config format (#126) (085c673a)
- type layout data (#125) (9b8bb7bc)
- cleanup components (#110) (7f4e6450)
- setup folders for visual-editor components (#106) (0c7549c1)
- move useDocument, DocumentProvider from pages (#101) (0dd123e6)

#### 0.0.13 (2024-10-22)

##### Chores

- clean up theme manager (#85) (bbe4f51a)

##### Documentation Changes

- themeResolver and applyTheme documentation (#97) (2305fae8)

##### New Features

- add hash to ThemeSaveState (#91) (e1060b72)
- add theme preview support (#92) (dd6b369d)
- add dev mode theme preview (#86) (aac0527a)

##### Bug Fixes

- sidebar loses focus on input (#100) (d2049ec3)
- remove outerHTML vulnerability (#95) (396042c1)
- update puck history with new layout's config in theme mode (#93) (cd002787)

##### Refactors

- switch <AutoFieldPrivate> to <AutoField> (#98) (c5e80f46)
- separate message receivers (#90) (7309a905)
- simplify Editor.tsx and create LayoutEditor and ThemeEditor (#88) (243ef26a)
- always use px for theme number fields (#89) (f186516c)
- separate theme manager and visual editor internal editors (#87) (7049a562)

#### 0.0.12 (2024-10-11)

##### Bug Fixes

- don't load theme data when not in theme mode (ad051c32)

#### 0.0.11 (2024-10-11)

##### New Features

- **dev:** fix themes (#84) (e19ec2e4)
- load themes from content on published pages (#83) (eb01dbb1)
- handle theme data from content and local storage (#82) (ac768866)
- save theme data to YSS (#81) (d2043342)
- remove theme mode toggle (#79) (418bddf5)
- receive isThemeMode from storm (#76) (9e98ae0d)
- **components:** add react-color color picker (#68) (59afa7a8)

##### Bug Fixes

- **components:** fixed history desync after publish (#75) (0d08b035)

##### Refactors

- generate theme variables automatically and merge saved state with themeConfig for UI (#77) (7a8f8055)

#### 0.0.10 (2024-10-04)

##### Chores

- add test with react testing library (#62) (e0d545fc)

##### Documentation Changes

- adjust READMEs and move internal code (#64) (ba784362)

##### New Features

- add toggle for "Use Entity Field" vs "Use Constant Value" (#70) (a5bfe5e1)
- theme editor sidebar (#74) (b6902481)
- toggle theme editing mode (#65) (65d4e610)
- **util:**
  - add buildCssOverridesStyle (#72) (7ea4eebf)
  - add themeResolver (#69) (370ecac0)
  - use built-in fields (#73) (6347bef2)
  - use local stream for entity fields in dev mode (#61) (8a19028e)

##### Bug Fixes

- hide sidebar titles in theme mode via DOM (#71) (95c32294)
- add undefined to return type of resolveYextEntityField (#66) (1b3ab2b8)

##### Refactors

- rename EntityFieldType to YextEntityField (#67) (564933f7)

#### 0.0.9 (2024-09-26)

##### Chores

- pin Puck (a1bfd375)

##### Documentation Changes

- documentation updates for mappable fields (#58) (15e95382)

##### New Features

- hide static value field for complex entity types (#60) (51cc136e)

##### Bug Fixes

- update field filtering logic (#59) (040b919d)
- additional resolveYextEntityField undefined checks (#57) (7c03b721)
- mappable fields filter updates (#56) (a2622fe4)
- fields not returned by type when type was a subfield (1a5c5939)
- selector return type signature (#55) (42c70ce6)
- undefined checks for mappable fields (#54) (dcf4baa6)

#### 0.0.8 (2024-09-25)

##### Chores

- update to latest (official) puck version (54c6083d)
- add .idea to .gitignore (#46) (806e7239)

##### New Features

- constant value for mappable fields (#49) (745fcb1c)
- **util:**
  - add renderEntityFields function (#44) (ef7cc7bb)
  - add resolveProp function (#45) (37ceeff7)

##### Refactors

- mappable fields with static values version 2 (#53) (3dfe0382)

#### 0.0.7 (2024-09-16)

##### Chores

- remove old comment (beb59564)
- update to latest Puck canary (#41) (c7834fbb)

##### Documentation Changes

- update usePlatformBridgeDocument change (#36) (aa23b741)

##### New Features

- add and export schema types for streams (2d036e44)
- add hooks/provider for entityFields (#37) (9f6763ea)

##### Bug Fixes

- wrap EntityField in div (#42) (8f27df55)
- accordions inside EntityField tooltip (#43) (f2770c59)
- css was overriding components not in visual-editor library (#40) (2633e0c0)
- entity fields toggle incorrectly switching off (#39) (2e2d45ee)
- puckInitialHistory not set in time (#38) (5b8c73c2)

#### 0.0.6 (2024-08-29)

##### Chores

- move react and react-dom to peer dependencies (#33) (f60ed657)

##### Bug Fixes

- add css to EntityField (#35) (6a78b57c)
- handle unrecognized origin (#34) (059db804)
- loadPuckInitialHistory is never called (#32) (2b132b0e)
- make \_site object available on documents in dev mode (#31) (3b4f904f)

##### Other Changes

- update useDocumentProvider name to usePlatformBridgeDocument (#30) (9e91f4ad)

#### 0.0.5 (2024-08-27)

##### New Features

- add debug logging with xYextDebug (#28) (209a6b86)

##### Bug Fixes

- add null check to message.data (#29) (36505bb3)

#### 0.0.4 (2024-08-26)

##### New Features

- add devOverride functionality (#26) (237db9af)

##### Bug Fixes

- make quick find keyboard shortcut work (#25) (c4e1fca5)
- redirecting on localhost (#27) (d770a478)
- prevent error in resolveVisualEditorData (#24) (d8b15281)

##### Refactors

- rename puckConfigs parameter to componentRegistry (#23) (3671728f)

#### 0.0.3 (2024-08-21)

##### Bug Fixes

- content data within history object (#22) (5629486e)
- remove tooltip warning (#21) (cef55282)

#### 0.0.2 (2024-08-15)

##### Documentation Changes

- add developer guide (#19) (b2eaf28c)

##### New Features

- remove view page button from header (#16) (ca9bef1c)
- change toggle button to switch (#15) (2369fb21)
- redirect to 404.html if origin is not in storm (#17) (0e86cff1)

##### Bug Fixes

- update Puck after clearing local changes and fix undo state (#18) (3b336316)
