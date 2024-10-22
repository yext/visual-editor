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
