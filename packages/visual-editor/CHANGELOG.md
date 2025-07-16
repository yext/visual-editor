#### 0.0.47 (2025-07-11)

##### New Features

- document data in reviews component (#611) (d8cf5e94)

##### Bug Fixes

- use shared getPath for Directory/Locator/NearbyLocations links (#615) (b8df0d80)
- hide/show props for Header CTAs (#610) (c907e70b)

#### 0.0.46 (2025-07-10)

##### Chores

- update default layout data again (#600) (0860c140)
- add component screenshot tests (#578) (cb824451)

##### New Features

- add ReviewStars atom to Hero (#589) (f077fd19)
- add workflow to clean up dev release branches (#591) (cfeb3252)
- add borderRadius selector (#597) (098ea85a)
- add theme Image section with BorderRadius (#599) (ddcb733c)

##### Bug Fixes

- logo alignment WRT links alignment (#607) (8b3b664a)
- copyright message alignment based on secondary links alignment (#609) (c1626ae7)
- added tiktok link (#608) (c7019eea)
- text wrapping for footer links (#606) (d8f065e9)
- show header background color on mobile (#605) (22081d25)
- hero hours (#602) (6c6b549c)
- add defaultItemProps for Expanded Footer Links (#604) (a8a45a30)
- test updates for recently added tests (#601) (75fff8ae)

#### 0.0.45 (2025-07-09)

##### Chores

- clean up header/footer image styling (#598) (701050f3)

##### New Features

- non-link analytics for ReviewsSection (#586) (c8cd28af)

##### Bug Fixes

- language dropdown fails page generation (#596) (1ab4d398)

#### 0.0.44 (2025-07-09)

##### Chores

- update default layout data for expanded header and footer (#594) (0d50bec9)
- deprecate header and footer (#592) (4af3c076)
- upgrade search-ui-react for more translations (#581) (458148f7)
- swap from eslint to oxlint (#553) (358fcd61)

##### New Features

- add backgroundColor to Breadcrumbs and Directory (#585) (51d301b4)
- expanded header and footer (#593) (5d78f64c)
- set up workflow to create a new dev release (#580) (3fcadbbc)
- reviews component (#564) (12b08b42)
- add non-link analytics to FAQ section and mobile header (#574) (a00a972c)
- add image styling props (#573) (012471ac)
- add Open Now button to locator (#569) (3a70acd7)
- add rtf functionality (#560) (81fe991d)
- make banner text RTF (#567) (9f75e959)
- hide banner if missing data (#566) (a617291f)
- add reviews component skeleton (#561) (cfa011ad)
- update i18n for context (#559) (0fba9813)
- add links to nearby location cards (#554) (dc968be3)
- **components:** add card styles (#583) (cc454c8d)

##### Bug Fixes

- display heading spans as block (#590) (e290f4f4)
- update hero/promo images on mobile (#588) (017d0ba5)
- re-add directory card border (#587) (25fe6d37)
- set default button font to font-normal (#584) (22eef1aa)
- default_directory to defaultdirectory in starter (#579) (bdec50cb)
- truncate strings in BasicSelector (#572) (6251f611)
- nearbyLocations warning spam (#576) (9895d54e)
- reduce fonts imported into generated pages (#571) (a1ccd2fe)
- update faq to work without js (#565) (64db6d6e)
- react warnings and proxied dev migrations (#563) (278bedef)
- default language dropdown value in Editor (#557) (a71a90d7)
- add missing locale labels (#555) (222e08a3)
- **components:** added missing i18n to header (#570) (06f517eb)

##### Refactors

- update hoursTable translations (#575) (ca7b88f2)
- adjust analytics (#562) (7ae1756e)
- background color selector (#558) (d43d7417)
- remove chevron from entity field selector (#556) (d49ea059)

#### 0.0.43 (2025-06-18)

##### Bug Fixes

- locator results link (5fb1767e)

#### 0.0.42 (2025-06-18)

##### Chores

- upgrade pages and pages-components for local dev (#540) (1a3b54a5)
- hide translation diffs (#533) (29218359)
- separate translatableString and RTF2 configs (#531) (aae76f64)
- remove collections (#523) (fa38702f)
- add site setting instructions to hybrid development docs (#519) (5660b844)

##### New Features

- update template manifest (#552) (40f9a418)
- add defaultProps to arrays (#551) (b3b0e90e)
- add “near me” button and add analytics to locator (#542) (5538429b)
- add hasLocalizedValue to translation struct (#546) (9301c284)
- add heading styles for promo section (#541) (bf86a330)
- add directory root prop (#539) (937101eb)
- const value defaults for non-core components (#536) (3a012497)
- add heading align for testimonial component (#537) (4be4bee4)
- edit constant value rtf fields in drawer (#538) (68880607)
- add heading alignment prop (#522) (4b0ebcbd)
- translate Phone label for CoreInfoSection (#527) (58efda1c)
- add i18n for CTA type and locale labels (#524) (732e2d80)
- add i18n support in components (#520) (56808e04)
- add Language Dropdown to Header (#514) (9840a74d)
- add platform translations part 2 (#521) (01cbd9a7)
- add platform translations part 1 (#509) (c6dffaec)
- useDocumentLocale for constant value translations (#518) (e2d2a778)
- add constant value i18n support (#508) (08256922)

##### Bug Fixes

- limit mapbox size (#550) (0944f985)
- persist struct constant value (#547) (e8fabc6d)
- translate "Get Directions" (#526) (a97d81a7)
- add struct label translation (#525) (c4f25193)
- allow multiple phones in phone list (#515) (af0e2391)

##### Refactors

- translatable string labels (#543) (ed25db0a)
- add overrides for specific problem fonts (#548) (fbaa14d0)
- struct fields (#532) (88fc8a13)
- remove unsupported fonts (#528) (ad4941f4)

##### Tests

- add i18n Github action check (#504) (ae14f3e5)

#### 0.0.41 (2025-06-05)

##### Chores

- update languages to generics (#506) (8a3f5ddc)
- automatic testing improvements (#488) (1075bcfa)

##### Documentation Changes

- update Migrations title (#478) (f46727d3)
- add hybrid implementation docs (#469) (2b68f25d)

##### New Features

- make locator map interactive and update locator component stylings (#511) (82b24620)
- add hoursTable atom with translations (#502) (9a3564cd)
- set translation languages (#503) (76861274)
- add translations for HoursStatus (#494) (57cc29f9)
- add generateTranslation script (#501) (305a9633)
- extract strings for translation (#483) (0f5f4e7c)
- resize tooltips based on viewport (#497) (81ec1b9d)
- update analytics (#496) (1bb41c3d)
- add RTF body variants (#493) (54603344)
- update colors for entity field tooltips (#491) (f8ca4514)
- show entity type name in field label (#489) (e93e5448)
- use string constant value for RTF (#492) (46f08312)
- adjust paths in main template (#490) (d049168d)
- support component prop overrides (#486) (b209aec8)
- add entity field switch (#485) (3f244a28)

##### Bug Fixes

- ignore email list length in constant value mode (#513) (efd52422)
- update template manifest description (#510) (0787f847)
- hide email list length when using constant value (#500) (61baef67)
- handle static fonts with multiple weights (#487) (fbe4be5b)
- do not cleanup manifest file (#477) (e1938299)

##### Refactors

- enable locales in hours status (#512) (a831d64f)
- only comment migration warning once (#499) (4338c25c)

#### 0.0.40 (2025-05-22)

##### Chores

- improve automated tests (#459) (1210ee5b)
- update test data (#454) (e63591aa)

##### New Features

- update publish to update pages (#471) (ef9567a8)
- update fields to data, styles, liveVis format (#475) (ca9681b7)
- font search (#474) (baffdbb4)
- header updates (#470) (2b4ca9b7)
- update text and tooltip for YextEntityFieldSelector (#472) (5db5b0aa)
- expand font options (#460) (d1090523)
- phone constant input (#468) (2fc2c589)
- add search locator component (#453) (b5752a0e)
- add migration check (#462) (15611fcc)
- use app API key for analytics (#465) (2066858a)
- update NearbyLocations to use new document data (#463) (277d788c)
- generate template manifest (#451) (591e3549)
- add modal for Send for Approval flow (#456) (41ddab2a)
- support boolean and option with YextEntityField (#458) (7f4e8492)
- data migrations (#452) (cee1c445)
- add const value support for testimonials section (#449) (62c04ffc)
- support const values for team section (#448) (b93ac418)
- add const support for faqs section (#447) (8b3b45e6)
- product section const value support (#444) (0a29c8da)
- insight section const value support (#443) (556360d1)
- event section constant value support (#441) (3785204a)

##### Bug Fixes

- fix image warnings (#467) (8ef85bd0)
- react warnings and RTF styling (#455) (05fe4dc6)
- small component updates (#466) (302f8c1d)
- remove text-body-fontSize-sm (#464) (6a0c378d)
- card heading levels (#457) (4b3276f4)
- hide columns in CoreInfoComponent if no data (#442) (be00e55d)
- cleanup component registry (#439) (8997d635)

##### Refactors

- handle missing data in Insights and Products (#473) (7b318116)
- update entity field tooltips (#445) (8148f7c7)

#### 0.0.39 (2025-05-09)

##### New Features

- built-in fields component updates (#434) (6243f6f2)
- support fullstory in editor iframe (#423) (0b30929a)
- apply headerScript from document (#413) (9542a127)

##### Bug Fixes

- adjust list types (#438) (b22c3a92)
- heading -> name (#437) (a86c629f)
- adjust types (#436) (1cee828d)
- upgrading doesn't break page generation (#435) (a315bc08)

#### 0.0.38 (2025-04-29)

##### New Features

- add directory template (#409) (3a799774)
- add rows option to grid (#406) (63972234)
- support type.rich_text_v2 (#405) (70d310e2)

##### Bug Fixes

- remove buildSchema logic and use document.\_schema (#408) (43567ba9)
- photoGallery returning zero (#407) (85b68294)
- disallow all pointer events and hover states in Theme Editor (#395) (93cf75ff)

#### 0.0.37 (2025-04-25)

##### Bug Fixes

- issue calling .map on undefined (#404) (cae399fa)

#### 0.0.36 (2025-04-24)

##### Bug Fixes

- handle undefined in FAQsSection (#403) (8167d831)
- handle older FAQs components w/o collection values (#402) (ea4fb08d)

#### 0.0.35 (2025-04-24)

##### Chores

- add wcag testing (#367) (300e6e11)

##### New Features

- update mapbox size on various events (#366) (d294da17)
- adjust FAQsSection into Collection (#397) (9f0dcc28)
- add docs build (#389) (78405347)
- add alignItems to flex (#385) (8a9a9724)
- use field display names in Entity Field selector (#380) (655319ad)
- add liveVisibility prop to Promo (#381) (78e355b4)
- add YextField (#373) (d9dc7574)

##### Bug Fixes

- hero link misalignment (#401) (69559e49)
- adjust YextEntityFieldSelector (#400) (247fcd1e)
- adjust PhotoGallery to supports constant (#398) (e3d249f5)
- fix Collection "grid" mode applying in entity mode (#394) (6c8162ed)
- photoGallery bugs and update for list (#393) (3c0a9822)
- swap to commonjs for postcss and registry build (#392) (383e3441)
- handle ComplexImageType in image atom (#391) (2c4d80e4)
- entity fields missing in local dev (#390) (60165b49)
- replace break-all in Promo (#388) (2acb8a53)
- header image size on mobile (#387) (3e9ed2cd)
- handle visibilityWrapper on older props (#386) (da3c5cdf)
- hide header/footer links if Link is not set (#384) (9170f3d4)
- adjust Product Card props (#383) (69541a50)
- card heights adjust (#382) (17d26ae0)
- cta undefined (#378) (c09b5db8)
- switch unit test dependency install order (#379) (25353bad)
- adjust address in NearbyLocations (#375) (b3b2eee4)
- default address to entity value (#372) (a110ba29)
- don't render sample text if field is mapped (#371) (d7dfda74)
- correct column spacing for core info section (#370) (35f5a853)
- update yextVisualEditorPlugin (#369) (33ed059b)
- wcag issues (#368) (15cc4c4b)

##### Refactors

- move dm display name fields to dm namespace (#396) (015aaa1b)
- directory improvements (#374) (79c87c8b)
- move components into folders (#376) (d47766f0)
- separate component directories and alias imports (#343) (52f9b177)

#### 0.0.34 (2025-04-13)

##### New Features

- merge new components (#365) (6a7e2391)

##### Bug Fixes

- remove plugin from /starter (#281) (8c06922c)

#### 0.0.33 (2025-03-21)

##### Bug Fixes

- adjust breadcrumbs (#278) (1f0db194)

#### 0.0.32 (2025-03-20)

##### Chores

- update pages components to 1.1.4 (#267) (9b1209c8)
- include local data in starter (#261) (f8433966)

##### New Features

- add yextVisualEditorPlugin() (#252) (b8f55213)
- get googleTagManagerId from visualEditorConfig instead of theme (#259) (20894caf)
- convert select fields to autocomplete combobox (#258) (e1d93afc)
- disable component selection in theme mode (#249) (9c4b7214)
- remove theme left panel, not needed after removing GTM (#255) (8727bdde)
- remove left toggle for theme manager (#254) (00a7e95b)

##### Bug Fixes

- google tag manager id path (#268) (54286cdc)
- add checks for breadcrumbs (#266) (8c4add71)
- adjust plugin on server start (#265) (dbccc919)
- read relativePrefixToRoot from templateProps (#262) (3787d8e6)
- editor returns error 404 when in reseller account (#260) (3ceb9167)
- visual editor fails to build (#257) (e395589d)
- write to localstorage in dev mode (#248) (d3861d8d)
- undefined footer links (#250) (307db820)
- prevent loading bar from going backwards (#247) (1d06d28b)

##### Refactors

- localstorage updates (#251) (f6f28b2b)
- remove entity fields toggle from theme editor (#253) (2f499827)

#### 0.0.31 (2025-02-27)

##### New Features

- add includeHyperlink option to Phone component (#246) (fd1f0190)
- add useTemplateProps (#245) (88c0caca)
- add Directory component (#243) (d7a4c754)

##### Refactors

- update components to use Link (#244) (a4f88b4b)

#### 0.0.30 (2025-02-25)

##### New Features

- prepend prefix to social fields (#241) (221b98a7)
- update Emails to use Link component (#223) (daa3f087)

##### Bug Fixes

- grid columns on mobile (#242) (a83837ce)
- useEntityFields must be used within VisualEditorProvider (#239) (d06dfee7)

##### Refactors

- header changes (#236) (4d4472c2)
- footer adjustments (#237) (d7f747a8)

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
