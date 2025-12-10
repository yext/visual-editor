#### 1.0.1 (2025-12-10)

##### New Features

- use custom fonts ([#932](https://github.com/yext/visual-editor/pull/932)) ([b40a06dc](https://github.com/yext/visual-editor/commit/b40a06dc7df858c7a72128043f08c68d61e9ef48))
- show custom fonts in theme editor ([#923](https://github.com/yext/visual-editor/pull/923)) ([f0cede8a](https://github.com/yext/visual-editor/commit/f0cede8a81138a6c5be2a17bb40163441961594f))
- full layout copy and paste ([#930](https://github.com/yext/visual-editor/pull/930)) ([afbf2aee](https://github.com/yext/visual-editor/commit/afbf2aee4e3ce7fd772a6c5ebf294602ee111720))

##### Bug Fixes

- shared styles lost when new card is added ([#938](https://github.com/yext/visual-editor/pull/938)) ([d1196961](https://github.com/yext/visual-editor/commit/d11969612cf181f27eb15995e4f4f0742bc074c3))
- state/history bugs ([#935](https://github.com/yext/visual-editor/pull/935)) ([811d9eee](https://github.com/yext/visual-editor/commit/811d9eee50f0622472510908fe2d69799290727e))
- save inputs immediately on blur ([#933](https://github.com/yext/visual-editor/pull/933)) ([e7c18893](https://github.com/yext/visual-editor/commit/e7c1889384c0e7157ba42cb09e649134108867b9))
- footer logo empty state and body font family for banner and hours table ([#934](https://github.com/yext/visual-editor/pull/934)) ([992631c7](https://github.com/yext/visual-editor/commit/992631c7985b86e56af1573fb12c9aa718a57087))

#### 1.0.0 (2025-12-03)

##### New Features

- add pagination to locator ([#924](https://github.com/yext/visual-editor/pull/924)) ([e687d1dc](https://github.com/yext/visual-editor/commit/e687d1dc5ce61fafd2cb2714a16b9795ca9ccead))

##### Bug Fixes

- logic in PromoSection slots migration ([#931](https://github.com/yext/visual-editor/pull/931)) ([ea6f36b7](https://github.com/yext/visual-editor/commit/ea6f36b7744042333e34bdb9e5c9c2b0e4a06cda))

#### 1.0.0-beta.3 (2025-12-02)

##### Chores

- merge fall-2025-slot-ify-components into main ([#928](https://github.com/yext/visual-editor/pull/928)) ([4418b6f2](https://github.com/yext/visual-editor/commit/4418b6f26b5a8213b8c143f9be43880fd90aa3c7))

##### New Features

- allow custom code component for all users ([#922](https://github.com/yext/visual-editor/pull/922)) ([fb049bb1](https://github.com/yext/visual-editor/commit/fb049bb1d912b939066c36d838e147380da4e4b3))

##### Bug Fixes

- undefined state error ([#917](https://github.com/yext/visual-editor/pull/917)) ([2c09fa18](https://github.com/yext/visual-editor/commit/2c09fa18cfb520d2eb4173b9dfcdb95cf59448d9))

#### 1.0.0-beta.2 (2025-11-24)

##### Chores

- upgrade pages-components to 1.1.16 ([#918](https://github.com/yext/visual-editor/pull/918)) ([a846b1ca](https://github.com/yext/visual-editor/commit/a846b1ca07a8422b05fec9e81406f0dd4039e6fd))
- increase threshold for recently flaky tests ([#911](https://github.com/yext/visual-editor/pull/911)) ([7a3cf1e3](https://github.com/yext/visual-editor/commit/7a3cf1e3d2928d6b622e04e35a6076cfa774e662))

##### Bug Fixes

- add optional chaining to streamDocument usages in migrations ([#888](https://github.com/yext/visual-editor/pull/888)) ([e5c119b0](https://github.com/yext/visual-editor/commit/e5c119b0624433fc9692c47a5978a2e15301eb8a))
- update default phone numbers ([#913](https://github.com/yext/visual-editor/pull/913)) ([a029ce05](https://github.com/yext/visual-editor/commit/a029ce05d133d5bec61b86f4871c78397d292595))

#### 1.0.0-beta.1 (2025-11-19)

##### Chores

- restore schema code from main branch ([8427b65e](https://github.com/yext/visual-editor/commit/8427b65eb2651eb282bdf3716d489e17abaded80))
- merge main into fall-2025-slot-ify-components ([#908](https://github.com/yext/visual-editor/pull/908)) ([051176d6](https://github.com/yext/visual-editor/commit/051176d6522eeb57b663e14e7b83c0525025cfb3))
- remove types from migrations ([#875](https://github.com/yext/visual-editor/pull/875)) ([04992786](https://github.com/yext/visual-editor/commit/04992786db5cb63d275bcf20d3bff4d73e4f3673))
- upgrade playwright ([#842](https://github.com/yext/visual-editor/pull/842)) ([c2d8558c](https://github.com/yext/visual-editor/commit/c2d8558cd48c3ca9b7c479bef2379965f86656fa))
- move Open Now in locator to filters modal ([#821](https://github.com/yext/visual-editor/pull/821)) ([809f4401](https://github.com/yext/visual-editor/commit/809f44019a9392f9620ddd33c62a86ad0b63d8ce))

##### New Features

- empty secondary header state ([#889](https://github.com/yext/visual-editor/pull/889)) ([6f8f7e9f](https://github.com/yext/visual-editor/commit/6f8f7e9f7cf1d7d776ef01bebb3ce277f3ebd72c))
- empty states for promo and banner sections ([#874](https://github.com/yext/visual-editor/pull/874)) ([759c0ef0](https://github.com/yext/visual-editor/commit/759c0ef073321ee12717360fd61e7d52a4299313))
- empty state for reviews section ([#869](https://github.com/yext/visual-editor/pull/869)) ([f59cd8ec](https://github.com/yext/visual-editor/commit/f59cd8ec849634659b2ad968c5c4b245cc90e312))
- empty state for NearbyLocations ([#868](https://github.com/yext/visual-editor/pull/868)) ([30f6b01c](https://github.com/yext/visual-editor/commit/30f6b01cec55e9b9fc873a677194214221cbb283))
- make showing distance options in filters modal a toggleable prop ([#866](https://github.com/yext/visual-editor/pull/866)) ([cf036a04](https://github.com/yext/visual-editor/commit/cf036a04c833d428e2791626f43a0b12a7aed514))
- add mapbox empty state ([#864](https://github.com/yext/visual-editor/pull/864)) ([de0ca722](https://github.com/yext/visual-editor/commit/de0ca72289bf7846b8d720ff33d08487bce9bd7c))
- derive Get Directions link in locator from ref_listings if present ([#860](https://github.com/yext/visual-editor/pull/860)) ([068bd240](https://github.com/yext/visual-editor/commit/068bd240bbcc2a87fdc3ba1b06341d82c056be22))
- read Locator starting location from initialLocation query parameter ([#849](https://github.com/yext/visual-editor/pull/849)) ([5e0ee30b](https://github.com/yext/visual-editor/commit/5e0ee30bb87b1c60e772bb903fa32729d1c410e7))
- remove empty values from schema ([#850](https://github.com/yext/visual-editor/pull/850)) ([7be26926](https://github.com/yext/visual-editor/commit/7be269268df49c417b8a7b85a3b6751ff6ce1f8c))
- add facets to locator component filter modal ([#833](https://github.com/yext/visual-editor/pull/833)) ([00dc6e45](https://github.com/yext/visual-editor/commit/00dc6e4593e65b73f61ea9a0e6f4708609be99fe))
- add breadcrumbs and reviews schema ([#843](https://github.com/yext/visual-editor/pull/843)) ([eb209b5c](https://github.com/yext/visual-editor/commit/eb209b5cd8f2f3622b396c98ec41e0ee00935f61))
- use ref_listings ([#846](https://github.com/yext/visual-editor/pull/846)) ([7e955c0a](https://github.com/yext/visual-editor/commit/7e955c0a2f8386fabb70b93ae92f91869b77dc8d))
- add root migrations and migrate schema ([#848](https://github.com/yext/visual-editor/pull/848)) ([19562ae9](https://github.com/yext/visual-editor/commit/19562ae9ae38fcb4e5c9835386d36f3548d64ebe))
- dynamic option selector field and locator dynamic fields setting ([#826](https://github.com/yext/visual-editor/pull/826)) ([05743973](https://github.com/yext/visual-editor/commit/057439732d361a7b9bbc1b83d32c7a44e50fc17d))
- add canonical url to pages ([#827](https://github.com/yext/visual-editor/pull/827)) ([f9d86987](https://github.com/yext/visual-editor/commit/f9d86987338df39335588962a628a0717ce592f3))
- remove all field icons ([#813](https://github.com/yext/visual-editor/pull/813)) ([3c96f5f1](https://github.com/yext/visual-editor/commit/3c96f5f124dd6ffa65442564df26a9e9725e81f5))
- add Banner Section to Locator and Directory pages ([#811](https://github.com/yext/visual-editor/pull/811)) ([0aeaeca7](https://github.com/yext/visual-editor/commit/0aeaeca73614ba65c00356ca0b2ef87eefde6d5f))
- provide default schema to parent window ([#791](https://github.com/yext/visual-editor/pull/791)) ([b8c4aa14](https://github.com/yext/visual-editor/commit/b8c4aa145bf813876eebf3d4e78805485a770e70))

##### Bug Fixes

- default layout data fixes ([#910](https://github.com/yext/visual-editor/pull/910)) ([18ea6156](https://github.com/yext/visual-editor/commit/18ea6156bddcb03bf1078a9d89db96e8c45bf198))
- handle insight section react issues and RTF's logic ([#906](https://github.com/yext/visual-editor/pull/906)) ([f7ec4e5a](https://github.com/yext/visual-editor/commit/f7ec4e5a52670799aef476fcea05be7bf66983e7))
- timestamp hydration issues ([#907](https://github.com/yext/visual-editor/pull/907)) ([731400d4](https://github.com/yext/visual-editor/commit/731400d4091f9581a45be8bba8cb3d74dd8541d6))
- set pointer capture errors leading to stuck state ([#901](https://github.com/yext/visual-editor/pull/901)) ([4a63b75b](https://github.com/yext/visual-editor/commit/4a63b75b4ad2c5a4d497dcf42c21aec7a10340de))
- classic hero image doesn't respect width prop ([#900](https://github.com/yext/visual-editor/pull/900)) ([1107aaed](https://github.com/yext/visual-editor/commit/1107aaedfb26c180f89eb223b79fc5485fc5f873))
- copyright not updating and alignments not respected ([#899](https://github.com/yext/visual-editor/pull/899)) ([f6954085](https://github.com/yext/visual-editor/commit/f6954085a83e87a9664cb129fb92b5fedab0e1d8))
- card image aspect ratios ([#897](https://github.com/yext/visual-editor/pull/897)) ([eb67d0e0](https://github.com/yext/visual-editor/commit/eb67d0e00f2b24e1d49a7cd372dbb0cefedf690b))
- directory title redirects and props ([#894](https://github.com/yext/visual-editor/pull/894)) ([891bbf9a](https://github.com/yext/visual-editor/commit/891bbf9a0633dc332caed88216f9790132508b35))
- allow other fields for Services list ([#896](https://github.com/yext/visual-editor/pull/896)) ([5b40d48e](https://github.com/yext/visual-editor/commit/5b40d48e1c0f71c097f18bf316c8e74591018805))
- faq and insight indexing ([#895](https://github.com/yext/visual-editor/pull/895)) ([32ae218f](https://github.com/yext/visual-editor/commit/32ae218fa76e63900dd994219c898c9981b029fb))
- team section event names ([#891](https://github.com/yext/visual-editor/pull/891)) ([eafaf145](https://github.com/yext/visual-editor/commit/eafaf145a41f50918e33f4d7b96105630bb1fc10))
- footer styles ([#893](https://github.com/yext/visual-editor/pull/893)) ([e072f10b](https://github.com/yext/visual-editor/commit/e072f10b77505f99bd390800d09a8835680d1f40))
- migrate missing props ([#887](https://github.com/yext/visual-editor/pull/887)) ([3f65c4e5](https://github.com/yext/visual-editor/commit/3f65c4e554fa50f0a12077cdeada853a37c5d888))
- header event names ([#892](https://github.com/yext/visual-editor/pull/892)) ([239368b6](https://github.com/yext/visual-editor/commit/239368b6e648735174c91196c881167494a0efc9))
- hero cta migration ([#890](https://github.com/yext/visual-editor/pull/890)) ([2f2ad55c](https://github.com/yext/visual-editor/commit/2f2ad55c0b73e85888ad3884f9a26781e44a997b))
- slots performance when tab is switched ([#883](https://github.com/yext/visual-editor/pull/883)) ([c23a2448](https://github.com/yext/visual-editor/commit/c23a2448ebc4c55fee1ffdea19952f926b74604c))
- address cta migration fallback ([#885](https://github.com/yext/visual-editor/pull/885)) ([49c524ed](https://github.com/yext/visual-editor/commit/49c524ed1ec83f6dade36972e59082e6cbbf697c))
- add slots to Locator config ([#879](https://github.com/yext/visual-editor/pull/879)) ([41761ce5](https://github.com/yext/visual-editor/commit/41761ce53b66cf2b77c6952cf1f895ae252b0fd4))
- restore functionality from merge ([#882](https://github.com/yext/visual-editor/pull/882)) ([e3bfe053](https://github.com/yext/visual-editor/commit/e3bfe0536f7f655225da0ea86303f6da67357432))
- only derive results summary name from location/countryCode ([#877](https://github.com/yext/visual-editor/pull/877)) ([8bc0c75e](https://github.com/yext/visual-editor/commit/8bc0c75eece6b8c0aa2df9effae10f5567e734e5))
- hide pill boxes for address.countryCode filters in locator ([#873](https://github.com/yext/visual-editor/pull/873)) ([4f3b28fc](https://github.com/yext/visual-editor/commit/4f3b28fcbee962abfee88093f24453c59f143ee3))
- schema resolution for special cases ([#862](https://github.com/yext/visual-editor/pull/862)) ([ecf2edc4](https://github.com/yext/visual-editor/commit/ecf2edc44dad36eca07251fd4621fcad4820c90d))
- locator migrations ([#865](https://github.com/yext/visual-editor/pull/865)) ([507da022](https://github.com/yext/visual-editor/commit/507da0222e3cf6d82bcc54e1305f58c27c6c3608))
- handle the equals matcher for field value static filters in locator ([#870](https://github.com/yext/visual-editor/pull/870)) ([b3dc19ee](https://github.com/yext/visual-editor/commit/b3dc19ee99a108f681b59a0bfa09c5582ae83a1b))
- adjust appearance and spacing of Locator Filter modal on small ([#867](https://github.com/yext/visual-editor/pull/867)) ([cca1907a](https://github.com/yext/visual-editor/commit/cca1907aeaf729dffe0fca8ea126188c09af0401))
- prevent re-rendering footer logo ([#861](https://github.com/yext/visual-editor/pull/861)) ([8d394ba8](https://github.com/yext/visual-editor/commit/8d394ba82a0abcac11e6936afa413fbc4b5a6f45))
- language picker when url templates are in use ([#840](https://github.com/yext/visual-editor/pull/840)) ([cefe7a6f](https://github.com/yext/visual-editor/commit/cefe7a6f2262a7e9b85e31d5aa45eca93b88a631))
- starter template ([#852](https://github.com/yext/visual-editor/pull/852)) ([cccf72a2](https://github.com/yext/visual-editor/commit/cccf72a2e19ad1c1da45304005e107d1eeb3cb0a))
- improve directory and locator schema ([#845](https://github.com/yext/visual-editor/pull/845)) ([1581ca46](https://github.com/yext/visual-editor/commit/1581ca46ce6ff56f6b5203c743c7769fba24ee0a))
- hours status not localized, filter does not persist ([#841](https://github.com/yext/visual-editor/pull/841)) ([7422d792](https://github.com/yext/visual-editor/commit/7422d792cab3b9ca76220f92dff681dd42b8c467))
- plugin build ([#844](https://github.com/yext/visual-editor/pull/844)) ([2cfbac9a](https://github.com/yext/visual-editor/commit/2cfbac9a55604897b7ad4b169cb47b41895ae741))
- directory meta fields ([#839](https://github.com/yext/visual-editor/pull/839)) ([012c91ad](https://github.com/yext/visual-editor/commit/012c91ad87416f9ca098b9690030b98d71130336))
- use timezone in HoursStatus content block ([#834](https://github.com/yext/visual-editor/pull/834)) ([9c73c51e](https://github.com/yext/visual-editor/commit/9c73c51eea9eeccf334bf0807d007ef268cabccb))
- locator phone number and search input ([#818](https://github.com/yext/visual-editor/pull/818)) ([e4b3fb09](https://github.com/yext/visual-editor/commit/e4b3fb09e378c850763d38037237ecf0b4aaaf3f))
- add pages-component css to rendered page css bundle ([#812](https://github.com/yext/visual-editor/pull/812)) ([33dd0b0a](https://github.com/yext/visual-editor/commit/33dd0b0aef86551e6b08f8e0de52fa2ccff6ad38))
- fixed position for expanded header ([#806](https://github.com/yext/visual-editor/pull/806)) ([85297926](https://github.com/yext/visual-editor/commit/8529792602024a1abba9dace26dd24d7ca4e1fac))
- provide LocalBusiness schema to location entity types ([#808](https://github.com/yext/visual-editor/pull/808)) ([3d0d392a](https://github.com/yext/visual-editor/commit/3d0d392a7f3f104ec482faa1b5b6c4903fe5863b))
- use entityPageSetUrlTemplates for resolving locator card urls ([#807](https://github.com/yext/visual-editor/pull/807)) ([74515526](https://github.com/yext/visual-editor/commit/74515526897bb30519eb2c53c89f0d34e8ccdd10))
- improve color contrast handling ([#805](https://github.com/yext/visual-editor/pull/805)) ([011d6c20](https://github.com/yext/visual-editor/commit/011d6c20571217e4305a301b2db629b4794fb376))
- refactor to remove vulnerability ([#799](https://github.com/yext/visual-editor/pull/799)) ([6e6dd90c](https://github.com/yext/visual-editor/commit/6e6dd90ca23efab778181b4122f6689e9193b6eb))
- load fonts in font selector ([#796](https://github.com/yext/visual-editor/pull/796)) ([bfcfe02d](https://github.com/yext/visual-editor/commit/bfcfe02d679288b63447cf3072a7d3a07c2c0095))
- fonts not loading in editor ([#793](https://github.com/yext/visual-editor/pull/793)) ([2eeb0f07](https://github.com/yext/visual-editor/commit/2eeb0f07d9407d96ffb06c2553077cf1503fb4ee))

##### Other Changes

- v0.0.64 ([ac4abe00](https://github.com/yext/visual-editor/commit/ac4abe0072c145a21bfb15a3cff7c74f59d4e99d))
- v0.0.63 ([3993d3ad](https://github.com/yext/visual-editor/commit/3993d3ad2026f355205fa5eb8bb2bf72638b8d9d))
- v0.0.62 ([b077096d](https://github.com/yext/visual-editor/commit/b077096d67acbd22d8e41d98e6fbbc8ee9393888))
- v0.0.61 ([a36cfe7e](https://github.com/yext/visual-editor/commit/a36cfe7e852f62a31505dd1388e357a3808d7ad4))
- v0.0.60 ([59b3fb36](https://github.com/yext/visual-editor/commit/59b3fb36ebfb315546009a536ff82b18d1ab6461))

#### 1.0.0-beta.0 (2025-11-05)

##### Chores

- slots QA part 4 ([#871](https://github.com/yext/visual-editor/pull/871)) ([e0d7c19b](https://github.com/yext/visual-editor/commit/e0d7c19bc4a9d56bfcbd244d5292bb3a8bb827a2))
- add placeholder images to defaultLayoutData ([9bfbbf69](https://github.com/yext/visual-editor/commit/9bfbbf697a593d086c5f53562b5bf10ed9545636))
- update layout data for version 41 ([#854](https://github.com/yext/visual-editor/pull/854)) ([c11ab898](https://github.com/yext/visual-editor/commit/c11ab898d7cb768c074ec21462b9802437cacadb))
- merge 'main' into 'fall-2025-slot-ify-components' ([#853](https://github.com/yext/visual-editor/pull/853)) ([5e4a7610](https://github.com/yext/visual-editor/commit/5e4a7610808b516484c955fce5ff87d7ef8d4194))
- merge main into fall-2025-slot-ify-components ([#814](https://github.com/yext/visual-editor/pull/814)) ([1943100a](https://github.com/yext/visual-editor/commit/1943100a13b10e8deeee7553000674ed4bbc30aa))
- merge main into fall-2025-slot-ify-components ([#804](https://github.com/yext/visual-editor/pull/804)) ([29222343](https://github.com/yext/visual-editor/commit/29222343d6de9aebb2be30776fdabb0bb0263553))
- page section translations and pass document in metadata ([#798](https://github.com/yext/visual-editor/pull/798)) ([c3c4f426](https://github.com/yext/visual-editor/commit/c3c4f42689abbc95aa6588a1439c64ed634c9e28))
- add VideoSection tests ([#795](https://github.com/yext/visual-editor/pull/795)) ([66f84bf7](https://github.com/yext/visual-editor/commit/66f84bf7a1cea5e13f5eed4d388ffc50e3031cbc))

##### New Features

- new placeholders and delete state for images ([#858](https://github.com/yext/visual-editor/pull/858)) ([4ef41432](https://github.com/yext/visual-editor/commit/4ef414324327ff9d9a15f75f0dc2b609366f473b))
- slot-ify footer ([#838](https://github.com/yext/visual-editor/pull/838)) ([57ac5d38](https://github.com/yext/visual-editor/commit/57ac5d38d4d42eac2f8f215b0a86e5ed90db6003))
- slotify expanded header ([#837](https://github.com/yext/visual-editor/pull/837)) ([e5b432ea](https://github.com/yext/visual-editor/commit/e5b432ea429200f634b238507e1ccef6828428cf))
- slot-ify directory ([#832](https://github.com/yext/visual-editor/pull/832)) ([8bc88a91](https://github.com/yext/visual-editor/commit/8bc88a913136bf2d7287ab39e0e51538e29778b9))
- slot-ify reviews ([#831](https://github.com/yext/visual-editor/pull/831)) ([bdfd91a9](https://github.com/yext/visual-editor/commit/bdfd91a9631275b381eaeb39f848ba6da0cf23a5))
- slot-ify PhotoGallerySection ([#828](https://github.com/yext/visual-editor/pull/828)) ([146d3450](https://github.com/yext/visual-editor/commit/146d34503d1f096338fb96b7f76e189e14a8713f))
- slot-ify testimonial section ([#830](https://github.com/yext/visual-editor/pull/830)) ([dc69f83d](https://github.com/yext/visual-editor/commit/dc69f83d429c1b9e169cfc14f7f37fbe1e88affe))
- use slots in nearby locations section ([#823](https://github.com/yext/visual-editor/pull/823)) ([58a219b2](https://github.com/yext/visual-editor/commit/58a219b26bcb24e313184bd21bce1730265909ca))
- slot-ify FAQSection ([#825](https://github.com/yext/visual-editor/pull/825)) ([2a630898](https://github.com/yext/visual-editor/commit/2a630898838fad309dd69e825b25537c49da2c91))
- slot-ify team section ([#824](https://github.com/yext/visual-editor/pull/824)) ([e685a186](https://github.com/yext/visual-editor/commit/e685a186687def4c197012999d21fe0e97cf1b39))
- slot-ify insights section ([#817](https://github.com/yext/visual-editor/pull/817)) ([16917c1a](https://github.com/yext/visual-editor/commit/16917c1ab34832063b0accd2048557f03980439f))
- use slots in events section ([#815](https://github.com/yext/visual-editor/pull/815)) ([3d4b9ee4](https://github.com/yext/visual-editor/commit/3d4b9ee4702597b482688654670ab51e3d7d408e))
- use slots in Product Section ([#810](https://github.com/yext/visual-editor/pull/810)) ([97dd7052](https://github.com/yext/visual-editor/commit/97dd70528a06ccdd9060df6720a87fd5cbb00b1a))
- slot-ify hero section ([#809](https://github.com/yext/visual-editor/pull/809)) ([9cde54c7](https://github.com/yext/visual-editor/commit/9cde54c78c2900d810ba32493d62889cdce4c4a7))
- use slots in promo section ([#803](https://github.com/yext/visual-editor/pull/803)) ([2620c2fb](https://github.com/yext/visual-editor/commit/2620c2fb1e5a91bc15b23e144e54bf32ab7e5ce9))
- slot-ify emails and phones for CoreInfoSection ([#801](https://github.com/yext/visual-editor/pull/801)) ([70a1ba0b](https://github.com/yext/visual-editor/commit/70a1ba0be4a22395b45147b8428bfc1bf6a5f785))
- slot-ify HoursTable and TextList for CoreInfoSection ([#800](https://github.com/yext/visual-editor/pull/800)) ([fadad574](https://github.com/yext/visual-editor/commit/fadad57429e1b4569fcea0a254ef5ecc59c0e459))
- add address slot ([#794](https://github.com/yext/visual-editor/pull/794)) ([c9fdd82a](https://github.com/yext/visual-editor/commit/c9fdd82a7ae7f38ec9bef8a2b539c56c6f0b49b5))
- use slots for Video Section ([#797](https://github.com/yext/visual-editor/pull/797)) ([b26640d6](https://github.com/yext/visual-editor/commit/b26640d618e0c0234c10a67c6f93cb40fa478a1c))
- add heading text slot ([#790](https://github.com/yext/visual-editor/pull/790)) ([7a677345](https://github.com/yext/visual-editor/commit/7a67734515c7e30716f4bb9257aa92684a856f7b))
- use img sizes attribute to improve page load speed ([#767](https://github.com/yext/visual-editor/pull/767)) ([db37b1d0](https://github.com/yext/visual-editor/commit/db37b1d0af81700827fce4e98368a24e2e860d8d))

##### Bug Fixes

- slots qa part 3 ([#863](https://github.com/yext/visual-editor/pull/863)) ([b2176684](https://github.com/yext/visual-editor/commit/b21766848da98dac89b1b8857c7105fed09a83d4))
- slots qa part 2 ([#859](https://github.com/yext/visual-editor/pull/859)) ([70d95e51](https://github.com/yext/visual-editor/commit/70d95e51a18d49a6bf733885e508f3445dedfbd1))
- promoSection migration with Video / Image ([#857](https://github.com/yext/visual-editor/pull/857)) ([885a26a3](https://github.com/yext/visual-editor/commit/885a26a3bd66092d11dbb238e953fe21600ad549))
- slots qa part 1 ([#855](https://github.com/yext/visual-editor/pull/855)) ([b36ff437](https://github.com/yext/visual-editor/commit/b36ff437a1a0a1f9e41ed0d893ad6580a537714a))
- migrations for slots ([#856](https://github.com/yext/visual-editor/pull/856)) ([bf6d2304](https://github.com/yext/visual-editor/commit/bf6d230472c8de441e8cc2054907b005458fa201))
- translation updates ([#851](https://github.com/yext/visual-editor/pull/851)) ([6b608673](https://github.com/yext/visual-editor/commit/6b608673d7a0b5a4e70560c6cf399c54fe8f6432))
- resize and truncate prop breadcrumbs ([#835](https://github.com/yext/visual-editor/pull/835)) ([23040767](https://github.com/yext/visual-editor/commit/23040767c3bc08584abd015c650f7d5700a46426))
- use parent id in migrated card ids ([#836](https://github.com/yext/visual-editor/pull/836)) ([6eeacdf0](https://github.com/yext/visual-editor/commit/6eeacdf053f0faf4b7f9e9c5cc7506b27f5102fd))
- duplicate action bar in promo and hero ([#822](https://github.com/yext/visual-editor/pull/822)) ([97d1873f](https://github.com/yext/visual-editor/commit/97d1873f579d7d178b7691b7d82333c993ae4238))
- miscellaneous slot bugs ([#816](https://github.com/yext/visual-editor/pull/816)) ([673cd303](https://github.com/yext/visual-editor/commit/673cd30363281f60ce834a478653338e76d4cf8d))
- insert schema as json instead of string ([#789](https://github.com/yext/visual-editor/pull/789)) ([752341c5](https://github.com/yext/visual-editor/commit/752341c5c89e533ad1f43597cdff61840814c7a4))
- locator jumpiness on hours component ([#787](https://github.com/yext/visual-editor/pull/787)) ([2d3b649e](https://github.com/yext/visual-editor/commit/2d3b649e4620347ca0970b04a69cf45cc13970b4))
- photo gallery css and update component tests ([#786](https://github.com/yext/visual-editor/pull/786)) ([b2eeabb8](https://github.com/yext/visual-editor/commit/b2eeabb8919d4149deaf56fa59ac11d94ad8ee55))

##### Other Changes

- v1.0.0-beta.0" ([6118c363](https://github.com/yext/visual-editor/commit/6118c363aa20d5d1be084e1bacdc42209c22faf2))
- v1.0.0-beta.0 ([e1a1957c](https://github.com/yext/visual-editor/commit/e1a1957cae876c669b54d5307224801150d6b04c))

##### Refactors

- cta prop fields ([#819](https://github.com/yext/visual-editor/pull/819)) ([6f2ba069](https://github.com/yext/visual-editor/commit/6f2ba069b558e6c7b47f454587ba0e8b822bfd37))
- pass variants directly into resolveComponentData ([#788](https://github.com/yext/visual-editor/pull/788)) ([a7072ecb](https://github.com/yext/visual-editor/commit/a7072ecba993e065329b74291cec2dae90ae7b79))

#### 0.0.67 (2025-11-21)

##### Chores

- more release tag fixes ([#914](https://github.com/yext/visual-editor/pull/914)) ([d59311ef](https://github.com/yext/visual-editor/commit/d59311ef0a12f7822255eda6461eabd37507f70f))

##### New Features

- customizable locator result cards ([#916](https://github.com/yext/visual-editor/pull/916)) ([019f599f](https://github.com/yext/visual-editor/commit/019f599fda1daa1dda8e679c7d3ef2555dd836a7))
- added grid-1 prop to existing grid layout ([#903](https://github.com/yext/visual-editor/pull/903)) ([6a08909a](https://github.com/yext/visual-editor/commit/6a08909a986e532e420b8b0014a47424b18f3471))
- adding comma seperated prop for TextList Component ([#902](https://github.com/yext/visual-editor/pull/902)) ([68a8e554](https://github.com/yext/visual-editor/commit/68a8e554b04f4d4a1059e721f71ccf60d72bd528))

##### Bug Fixes

- release tag sorting ([#909](https://github.com/yext/visual-editor/pull/909)) ([1d50111e](https://github.com/yext/visual-editor/commit/1d50111e14f365673726b5c0430ca9f09c513fe4))

#### 0.0.66 (2025-11-13)

##### Bug Fixes

- call migrate in locator template ([#904](https://github.com/yext/visual-editor/pull/904)) ([87abbf1d](https://github.com/yext/visual-editor/commit/87abbf1df499ff2e6dd31a3b986e5b778281daee))

#### 0.0.65 (2025-11-13)

##### Chores

- upgrade playwright ([#842](https://github.com/yext/visual-editor/pull/842)) ([c2d8558c](https://github.com/yext/visual-editor/commit/c2d8558cd48c3ca9b7c479bef2379965f86656fa))

##### New Features

- send schema preview to storm ([#876](https://github.com/yext/visual-editor/pull/876)) ([acd798ee](https://github.com/yext/visual-editor/commit/acd798ee0ffd1c79237ed4de100a8ecb1e844247))
- empty state for reviews section ([#869](https://github.com/yext/visual-editor/pull/869)) ([f59cd8ec](https://github.com/yext/visual-editor/commit/f59cd8ec849634659b2ad968c5c4b245cc90e312))
- empty state for NearbyLocations ([#868](https://github.com/yext/visual-editor/pull/868)) ([30f6b01c](https://github.com/yext/visual-editor/commit/30f6b01cec55e9b9fc873a677194214221cbb283))
- make showing distance options in filters modal a toggleable prop ([#866](https://github.com/yext/visual-editor/pull/866)) ([cf036a04](https://github.com/yext/visual-editor/commit/cf036a04c833d428e2791626f43a0b12a7aed514))
- add mapbox empty state ([#864](https://github.com/yext/visual-editor/pull/864)) ([de0ca722](https://github.com/yext/visual-editor/commit/de0ca72289bf7846b8d720ff33d08487bce9bd7c))
- derive Get Directions link in locator from ref_listings if present ([#860](https://github.com/yext/visual-editor/pull/860)) ([068bd240](https://github.com/yext/visual-editor/commit/068bd240bbcc2a87fdc3ba1b06341d82c056be22))
- read Locator starting location from initialLocation query parameter ([#849](https://github.com/yext/visual-editor/pull/849)) ([5e0ee30b](https://github.com/yext/visual-editor/commit/5e0ee30bb87b1c60e772bb903fa32729d1c410e7))
- remove empty values from schema ([#850](https://github.com/yext/visual-editor/pull/850)) ([7be26926](https://github.com/yext/visual-editor/commit/7be269268df49c417b8a7b85a3b6751ff6ce1f8c))
- add facets to locator component filter modal ([#833](https://github.com/yext/visual-editor/pull/833)) ([00dc6e45](https://github.com/yext/visual-editor/commit/00dc6e4593e65b73f61ea9a0e6f4708609be99fe))
- add breadcrumbs and reviews schema ([#843](https://github.com/yext/visual-editor/pull/843)) ([eb209b5c](https://github.com/yext/visual-editor/commit/eb209b5cd8f2f3622b396c98ec41e0ee00935f61))
- use ref_listings ([#846](https://github.com/yext/visual-editor/pull/846)) ([7e955c0a](https://github.com/yext/visual-editor/commit/7e955c0a2f8386fabb70b93ae92f91869b77dc8d))
- add root migrations and migrate schema ([#848](https://github.com/yext/visual-editor/pull/848)) ([19562ae9](https://github.com/yext/visual-editor/commit/19562ae9ae38fcb4e5c9835386d36f3548d64ebe))
- dynamic option selector field and locator dynamic fields setting ([#826](https://github.com/yext/visual-editor/pull/826)) ([05743973](https://github.com/yext/visual-editor/commit/057439732d361a7b9bbc1b83d32c7a44e50fc17d))

##### Bug Fixes

- allow selected distance to be unset ([#872](https://github.com/yext/visual-editor/pull/872)) ([16e94c7b](https://github.com/yext/visual-editor/commit/16e94c7b1446dbd9ae49a61dfed6054ba41e2657))
- hide filter modal when there is no applicable filters ([#880](https://github.com/yext/visual-editor/pull/880)) ([137e4fee](https://github.com/yext/visual-editor/commit/137e4fee5aab9a85a76025876174bcd5ce5e70fe))
- only derive results summary name from location/countryCode ([#877](https://github.com/yext/visual-editor/pull/877)) ([8bc0c75e](https://github.com/yext/visual-editor/commit/8bc0c75eece6b8c0aa2df9effae10f5567e734e5))
- hide pill boxes for address.countryCode filters in locator ([#873](https://github.com/yext/visual-editor/pull/873)) ([4f3b28fc](https://github.com/yext/visual-editor/commit/4f3b28fcbee962abfee88093f24453c59f143ee3))
- schema resolution for special cases ([#862](https://github.com/yext/visual-editor/pull/862)) ([ecf2edc4](https://github.com/yext/visual-editor/commit/ecf2edc44dad36eca07251fd4621fcad4820c90d))
- locator migrations ([#865](https://github.com/yext/visual-editor/pull/865)) ([507da022](https://github.com/yext/visual-editor/commit/507da0222e3cf6d82bcc54e1305f58c27c6c3608))
- handle the equals matcher for field value static filters in locator ([#870](https://github.com/yext/visual-editor/pull/870)) ([b3dc19ee](https://github.com/yext/visual-editor/commit/b3dc19ee99a108f681b59a0bfa09c5582ae83a1b))
- adjust appearance and spacing of Locator Filter modal on small ([#867](https://github.com/yext/visual-editor/pull/867)) ([cca1907a](https://github.com/yext/visual-editor/commit/cca1907aeaf729dffe0fca8ea126188c09af0401))
- prevent re-rendering footer logo ([#861](https://github.com/yext/visual-editor/pull/861)) ([8d394ba8](https://github.com/yext/visual-editor/commit/8d394ba82a0abcac11e6936afa413fbc4b5a6f45))
- language picker when url templates are in use ([#840](https://github.com/yext/visual-editor/pull/840)) ([cefe7a6f](https://github.com/yext/visual-editor/commit/cefe7a6f2262a7e9b85e31d5aa45eca93b88a631))
- starter template ([#852](https://github.com/yext/visual-editor/pull/852)) ([cccf72a2](https://github.com/yext/visual-editor/commit/cccf72a2e19ad1c1da45304005e107d1eeb3cb0a))
- improve directory and locator schema ([#845](https://github.com/yext/visual-editor/pull/845)) ([1581ca46](https://github.com/yext/visual-editor/commit/1581ca46ce6ff56f6b5203c743c7769fba24ee0a))
- hours status not localized, filter does not persist ([#841](https://github.com/yext/visual-editor/pull/841)) ([7422d792](https://github.com/yext/visual-editor/commit/7422d792cab3b9ca76220f92dff681dd42b8c467))
- plugin build ([#844](https://github.com/yext/visual-editor/pull/844)) ([2cfbac9a](https://github.com/yext/visual-editor/commit/2cfbac9a55604897b7ad4b169cb47b41895ae741))
- directory meta fields ([#839](https://github.com/yext/visual-editor/pull/839)) ([012c91ad](https://github.com/yext/visual-editor/commit/012c91ad87416f9ca098b9690030b98d71130336))

##### Other Changes

- v0.0.65" ([59f88ff7](https://github.com/yext/visual-editor/commit/59f88ff7983aae5590afdafe07e656eb33b4dd70))
- v0.0.65 ([384762cb](https://github.com/yext/visual-editor/commit/384762cb9494ad006bc01dce36e5a83c6ffd8878))

#### 0.0.64 (2025-10-24)

##### Chores

- move Open Now in locator to filters modal ([#821](https://github.com/yext/visual-editor/pull/821)) ([809f4401](https://github.com/yext/visual-editor/commit/809f44019a9392f9620ddd33c62a86ad0b63d8ce))

##### Bug Fixes

- use timezone in HoursStatus content block ([#834](https://github.com/yext/visual-editor/pull/834)) ([9c73c51e](https://github.com/yext/visual-editor/commit/9c73c51eea9eeccf334bf0807d007ef268cabccb))

#### 0.0.63 (2025-10-21)

##### New Features

- add canonical url to pages ([#827](https://github.com/yext/visual-editor/pull/827)) ([f9d86987](https://github.com/yext/visual-editor/commit/f9d86987338df39335588962a628a0717ce592f3))

#### 0.0.62 (2025-10-16)

##### Bug Fixes

- locator phone number and search input ([#818](https://github.com/yext/visual-editor/pull/818)) ([e4b3fb09](https://github.com/yext/visual-editor/commit/e4b3fb09e378c850763d38037237ecf0b4aaaf3f))

#### 0.0.61 (2025-10-10)

##### New Features

- remove all field icons ([#813](https://github.com/yext/visual-editor/pull/813)) ([3c96f5f1](https://github.com/yext/visual-editor/commit/3c96f5f124dd6ffa65442564df26a9e9725e81f5))
- add Banner Section to Locator and Directory pages ([#811](https://github.com/yext/visual-editor/pull/811)) ([0aeaeca7](https://github.com/yext/visual-editor/commit/0aeaeca73614ba65c00356ca0b2ef87eefde6d5f))

##### Bug Fixes

- add pages-component css to rendered page css bundle ([#812](https://github.com/yext/visual-editor/pull/812)) ([33dd0b0a](https://github.com/yext/visual-editor/commit/33dd0b0aef86551e6b08f8e0de52fa2ccff6ad38))
- fixed position for expanded header ([#806](https://github.com/yext/visual-editor/pull/806)) ([85297926](https://github.com/yext/visual-editor/commit/8529792602024a1abba9dace26dd24d7ca4e1fac))
- provide LocalBusiness schema to location entity types ([#808](https://github.com/yext/visual-editor/pull/808)) ([3d0d392a](https://github.com/yext/visual-editor/commit/3d0d392a7f3f104ec482faa1b5b6c4903fe5863b))
- use entityPageSetUrlTemplates for resolving locator card urls ([#807](https://github.com/yext/visual-editor/pull/807)) ([74515526](https://github.com/yext/visual-editor/commit/74515526897bb30519eb2c53c89f0d34e8ccdd10))
- improve color contrast handling ([#805](https://github.com/yext/visual-editor/pull/805)) ([011d6c20](https://github.com/yext/visual-editor/commit/011d6c20571217e4305a301b2db629b4794fb376))

#### 0.0.60 (2025-10-03)

##### New Features

- provide default schema to parent window ([#791](https://github.com/yext/visual-editor/pull/791)) ([b8c4aa14](https://github.com/yext/visual-editor/commit/b8c4aa145bf813876eebf3d4e78805485a770e70))
- use img sizes attribute to improve page load speed ([#767](https://github.com/yext/visual-editor/pull/767)) ([db37b1d0](https://github.com/yext/visual-editor/commit/db37b1d0af81700827fce4e98368a24e2e860d8d))

##### Bug Fixes

- refactor to remove vulnerability ([#799](https://github.com/yext/visual-editor/pull/799)) ([6e6dd90c](https://github.com/yext/visual-editor/commit/6e6dd90ca23efab778181b4122f6689e9193b6eb))
- load fonts in font selector ([#796](https://github.com/yext/visual-editor/pull/796)) ([bfcfe02d](https://github.com/yext/visual-editor/commit/bfcfe02d679288b63447cf3072a7d3a07c2c0095))
- fonts not loading in editor ([#793](https://github.com/yext/visual-editor/pull/793)) ([2eeb0f07](https://github.com/yext/visual-editor/commit/2eeb0f07d9407d96ffb06c2553077cf1503fb4ee))
- insert schema as json instead of string ([#789](https://github.com/yext/visual-editor/pull/789)) ([752341c5](https://github.com/yext/visual-editor/commit/752341c5c89e533ad1f43597cdff61840814c7a4))
- locator jumpiness on hours component ([#787](https://github.com/yext/visual-editor/pull/787)) ([2d3b649e](https://github.com/yext/visual-editor/commit/2d3b649e4620347ca0970b04a69cf45cc13970b4))
- photo gallery css and update component tests ([#786](https://github.com/yext/visual-editor/pull/786)) ([b2eeabb8](https://github.com/yext/visual-editor/commit/b2eeabb8919d4149deaf56fa59ac11d94ad8ee55))

##### Refactors

- pass variants directly into resolveComponentData ([#788](https://github.com/yext/visual-editor/pull/788)) ([a7072ecb](https://github.com/yext/visual-editor/commit/a7072ecba993e065329b74291cec2dae90ae7b79))

#### 0.0.59 (2025-09-26)

##### Chores

- upgrade pages-components to 1.1.3 ([#782](https://github.com/yext/visual-editor/pull/782)) ([5b1d567f](https://github.com/yext/visual-editor/commit/5b1d567f9732caef9b08777a1c629d7033a6a9cf))

##### Continuous Integration

- publishing improvements ([#781](https://github.com/yext/visual-editor/pull/781)) ([b927ef16](https://github.com/yext/visual-editor/commit/b927ef164a3cad7e81594645f3efe34573cd1aba))
- use npm trusted publishing ([#764](https://github.com/yext/visual-editor/pull/764)) ([92b05104](https://github.com/yext/visual-editor/commit/92b051040385fd59ca3379dbe6c257c3c4d63cba))

##### New Features

- use resolved user-edited schema ([#784](https://github.com/yext/visual-editor/pull/784)) ([864ce5b1](https://github.com/yext/visual-editor/commit/864ce5b19fa613fdab0b40810bda3ad95e33aabb))
- add Map Starting Location prop to Locator ([#777](https://github.com/yext/visual-editor/pull/777)) ([469c6856](https://github.com/yext/visual-editor/commit/469c68567069b23c8719595da2c4593594b9ebb2))
- add default schemas to advanced settings ([#775](https://github.com/yext/visual-editor/pull/775)) ([bd5a88a4](https://github.com/yext/visual-editor/commit/bd5a88a4fd9507a641b989dc5c5d328c15bf9aba))
- send schema markup message to YSS ([#771](https://github.com/yext/visual-editor/pull/771)) ([b7729e3d](https://github.com/yext/visual-editor/commit/b7729e3dde5480fb9972de967cd03c389eaf658b))
- add advanced settings in sidebar ([#769](https://github.com/yext/visual-editor/pull/769)) ([006ecf98](https://github.com/yext/visual-editor/commit/006ecf98090340228ac35bbd590932d6dfc3c8e3))
- component types documentation for AI ([#762](https://github.com/yext/visual-editor/pull/762)) ([86618dc3](https://github.com/yext/visual-editor/commit/86618dc35fd83f9cbd67a9c177edfb3a8601a950))

##### Bug Fixes

- make theme apply correct fonts ([#780](https://github.com/yext/visual-editor/pull/780)) ([e057f969](https://github.com/yext/visual-editor/commit/e057f96968c2c5daf1ad2fae1fd8cdfc24f919c0))
- cannot convert undefined or null to object sentry ([#785](https://github.com/yext/visual-editor/pull/785)) ([c69fcaff](https://github.com/yext/visual-editor/commit/c69fcaff41c08e6b2cd98c2e329343651071070b))
- save schemaMarkup to root across page loads ([#783](https://github.com/yext/visual-editor/pull/783)) ([fb00a939](https://github.com/yext/visual-editor/commit/fb00a939f48a112a322895204c5cd292492dfdd0))
- adjust height of insight, product, and team cards ([#779](https://github.com/yext/visual-editor/pull/779)) ([10991dbd](https://github.com/yext/visual-editor/commit/10991dbd6685b9afe47182cbefb913f440937051))
- mapbox performance on mobile ([#778](https://github.com/yext/visual-editor/pull/778)) ([fdc88a8b](https://github.com/yext/visual-editor/commit/fdc88a8b1466c870de6c37a9d73e3c46933a18b3))
- don't treat advanced settings as a component ([#772](https://github.com/yext/visual-editor/pull/772)) ([b6c9b976](https://github.com/yext/visual-editor/commit/b6c9b976fb679b75f1074fc8a2f6f0de9268bd9d))
- phoneNumbers in CoreInfoSection bombing out ([#773](https://github.com/yext/visual-editor/pull/773)) ([ba7049c7](https://github.com/yext/visual-editor/commit/ba7049c72890fc14d550706e7cd7fe95cfd63d90))
- handle event card description overflow ([#748](https://github.com/yext/visual-editor/pull/748)) ([69d5099c](https://github.com/yext/visual-editor/commit/69d5099c8ac014912312e1163317a9e36f80ec70))
- resolve base entity url templates in directory pages ([#770](https://github.com/yext/visual-editor/pull/770)) ([eb907bbb](https://github.com/yext/visual-editor/commit/eb907bbbd1c868ce8d4b695f8b6d979f6748a2e6))
- correct German 'open now' translation ([#768](https://github.com/yext/visual-editor/pull/768)) ([aaafe013](https://github.com/yext/visual-editor/commit/aaafe013aa61b21ab60fd18f770ec2eaaf7700b0))
- set openNow default prop for Locator ([#765](https://github.com/yext/visual-editor/pull/765)) ([358440f8](https://github.com/yext/visual-editor/commit/358440f820be342b3fd58a1064a2e63a7e0791ce))
- text list input ([#766](https://github.com/yext/visual-editor/pull/766)) ([ed8923e7](https://github.com/yext/visual-editor/commit/ed8923e7242f74318b3b9737892d1473c447c1dd))

##### Refactors

- styles into separate css exports ([#763](https://github.com/yext/visual-editor/pull/763)) ([baad20c4](https://github.com/yext/visual-editor/commit/baad20c41547a436c02adb8e86fdbcb66c19d160))

#### 0.0.58 (2025-09-12)

##### Chores

- move ve.config to package ([#756](https://github.com/yext/visual-editor/pull/756)) ([c2a34cc5](https://github.com/yext/visual-editor/commit/c2a34cc50cdeb8e4c68bc47dff44e7fca999714a))

##### Continuous Integration

- swap to public npm token ([e50af91a](https://github.com/yext/visual-editor/commit/e50af91a16a0d101de4f7693a7910f7ec8cd384b))
- swap to global npm token ([#761](https://github.com/yext/visual-editor/pull/761)) ([8f892e87](https://github.com/yext/visual-editor/commit/8f892e87ed5436374129d3ec05ec355bdb1cc3d0))

##### New Features

- handle embedded fields in html component ([#758](https://github.com/yext/visual-editor/pull/758)) ([722473b3](https://github.com/yext/visual-editor/commit/722473b377af1e5fbf4495e6640732d72d724029))

##### Bug Fixes

- dark brand colors in RTF ([#760](https://github.com/yext/visual-editor/pull/760)) ([0a0f3ed6](https://github.com/yext/visual-editor/commit/0a0f3ed65879173c5efc7ddcaa07185f031382a1))
- locator no results mobile width ([#757](https://github.com/yext/visual-editor/pull/757)) ([4734b6b1](https://github.com/yext/visual-editor/commit/4734b6b172d27fe903ccfd4b32053b59afea7cd3))
- resolve undefined 'state' error ([#755](https://github.com/yext/visual-editor/pull/755)) ([db52b5c8](https://github.com/yext/visual-editor/commit/db52b5c85d9d432506b0a0fd33acf9f0285ca549))

##### Other Changes

- v0.0.58 ([a83e4d23](https://github.com/yext/visual-editor/commit/a83e4d23285612c91518a604b42cc345a6292287))
- v0.0.58 ([2e1acfe8](https://github.com/yext/visual-editor/commit/2e1acfe86f96f2494914d46df0c08187e0491e18))
- v0.0.58 ([c88aaaa6](https://github.com/yext/visual-editor/commit/c88aaaa6299ecef7110a299d6bfb175865e79305))
- v0.0.58 ([409545a4](https://github.com/yext/visual-editor/commit/409545a4f074aea0a052a9a995f30967a47d38c1))
- v0.0.58 ([aff58b96](https://github.com/yext/visual-editor/commit/aff58b96984bab2ca607556bd8084177cbe21e55))
- v0.0.58 ([5161276a](https://github.com/yext/visual-editor/commit/5161276a6ab98e2c2f5e1b7a373e9c828dcdae45))
- v0.0.58 ([275081f6](https://github.com/yext/visual-editor/commit/275081f6de29fe70976d225c7184a53f61f14ac7))
- v0.0.58" ([fe55aa26](https://github.com/yext/visual-editor/commit/fe55aa26823287ab34a9650287d2d63a8e63a21c))
- v0.0.58 ([b02dedac](https://github.com/yext/visual-editor/commit/b02dedac7455d558486981c6dc87cc1fd84ff3ca))
- v0.0.58" ([ba09b6b4](https://github.com/yext/visual-editor/commit/ba09b6b40e620cc551d0b9b1a3cc635a22a711b1))
- v0.0.58 ([bd21958b](https://github.com/yext/visual-editor/commit/bd21958bf180f6664aa5309f2bfc804fd20e32ba))

#### 0.0.57 (2025-09-04)

##### Chores

- remove field not found warnings (#752) (ce9130f4)
- move theme config to package (#750) (bcc2658b)

##### Bug Fixes

- category filtering (#753) (0209525f)
- page metadata (#754) (42cd551f)
- cannot read properties of null error during editor load (#751) (66851806)
- prevent cta link from crashing when empty (#749) (eda3a461)
- fallback to primary template if alternate is missing (#747) (13b5a713)

#### 0.0.56 (2025-08-28)

##### Chores

- update fonts to match platform (#742) (57ad4b63)
- upgrade to Puck 0.20.1 (#741) (505199d9)
- ignore flaky footer change (#738) (758c63a2)
- add Grid test (#725) (243f9e14)
- continue improving flaky component tests (#722) (8b1d3468)

##### New Features

- use urlTemplate from \_pageset.config (#689) (20a49b83)
- video assets (#733) (baf30722)
- add Fixed option for Expanded Header (#737) (8f980987)
- improve locale deletion warning (#715) (e9223258)
- add liveVisibility to CustomCodeSection (#724) (5c51a2cd)
- have BannerSection's text use rich text (#723) (6085fd09)
- improve open now styling (#712) (5f360683)

##### Bug Fixes

- prevent HeroSection image flickering (#746) (bf66f553)
- image/video toggle (#745) (22a3ad09)
- embedded field conversion (#744) (bc51f892)
- translate select options (#743) (f0a1e74b)
- emailsComponent constant value crash (#740) (fab98f6c)
- add CTA Type option in entity field mode (#731) (bf0af512)
- prevent infinite re-renders with PhoneInput (#736) (80c4ace9)
- remove "flex-reverse" usage (#730) (c3865e83)
- live visibility in some sections (#732) (6da5356e)
- heroSection variants properly resolve struct fields (#729) (94e393db)
- adjust atoms to match new styling (#726) (2603cb31)
- use previously selected field for HeroSection and PromoSection (#728) (c389858d)

##### Other Changes

- open image upload drawer for static images (#687)" (#714)" (#716)" (#719)" (#721) (46ad0fa8)

##### Refactors

- additional asset image support (#727) (4f5676c2)

#### 0.0.55 (2025-08-14)

##### New Features

- update directory site name field (#720) (d0486843)
- add CTA Group component (#697) (888a41a8)
- hero variants (#704) (7a1c05ec)
- enhance CTA behavior (#702) (394d76b8)

#### 0.0.54 (2025-08-13)

##### New Features

- add Header Position prop to ExpandedHeader (#717) (39c4e8ef)
- add Hours props to directory (#711) (d9571b56)

##### Bug Fixes

- heroComponent's entity overrides broke (#718) (00033af3)

##### Other Changes

- open image upload drawer for static images (#687)" (#714)"" (#719) (4980aa9f)
- open image upload drawer for static images (#687)" (#714)" (#716) (548f6c80)

#### 0.0.53 (2025-08-12)

##### New Features

- sendLoadingProgress to parent (#707) (a35865a9)
- open image upload drawer for static images (#687) (29915e62)
- display hex values in background picker (#709) (5d7a2fe3)

##### Bug Fixes

- apply page section to grid (#713) (b5199d27)
- directory wrapping (#710) (0cbe8bd3)

##### Other Changes

- open image upload drawer for static images (#687)" (#714) (401d6585)

#### 0.0.52 (2025-08-11)

##### Chores

- add TranslatableString type to YextField (#706) (2fb957e8)

##### New Features

- update array field item labels (#708) (4b816dde)
- support category filtering (#705) (d3663709)
- warn when translation keys are deleted (#700) (f79ec675)
- allow different urls per locale for CTA links (#698) (800601d8)
- improve CoreInfoSection styling for tablet (#701) (1e03777a)

##### Refactors

- hybrid developer work flow (#699) (fdf820e1)

#### 0.0.51 (2025-08-06)

##### Chores

- test insight section (#680) (076c7219)
- update screenshot writing (#691) (b07849ef)
- update test folder name (#686) (51e8571b)
- more component test updates (#688) (18fa842d)
- reduce flaky tests again (#685) (95445a13)
- upgrade to Puck 0.19.3 (#658) (3ba22562)
- add tablet screenshots (#669) (57257316)
- swap react-phone-number-input to react-international-phone (#670) (ff603dc3)
- reduce flaky tests (#663) (60e33735)
- replace document with streamDocument (#655) (76f06fc5)

##### Documentation Changes

- add autogenerated component docs (#632) (9584c352)

##### New Features

- use entity type name in field selector (#695) (a0311f86)
- ignore locale warning flag (#694) (3fd52e01)
- support for component filtering (#673) (732cfe53)
- add max width options to ExpandedHeader and ExpandedFooter (#678) (4ebb12d8)
- revamp grid to new core information grid section (#660) (ddc7b253)
- nearbyLocations loading state and props fix (#676) (da347a02)
- use favicon from document (#671) (18240920)
- add i18n for contentBlocks (#664) (2860ed88)
- honor layoutTaskApprovals site setting (#667) (c2353a1b)
- custom code component (#662) (de78733e)
- use pageset contentEndpointId (#651) (645c06ce)
- use starter template for StackBlitz (#636) (1b852ec6)
- improve fallbacks for ZH languages (#644) (f134a75d)

##### Bug Fixes

- revert hoursStyling changes (#692) (4a42c7fa)
- small translation bugs for ExpandedFooter (#693) (02f5e3dc)
- coreInfo headingAlign prop applies to all columns (#677) (0396e0fa)
- collapse expanded header for narrow windows (#666) (bddb72bb)
- promo medium viewport (#674) (cb062991)
- long directory root causes breadcrumbs overflow (#665) (ef2cd309)
- typos (#672) (12f401bd)
- have photo gallery properly render on mobile view and promo in medium view (#668) (d164cc30)
- adjust padding in locator map (#661) (02110336)
- mapbox static map updates (#656) (407a0263)
- handle RTF objects outside of Translatables (#659) (0f5c6a09)
- use workspace for starter ve package (#657) (5b726020)
- removes horizontal padding from PromoSection's text (#654) (ea353ca8)
- add zh fallbacks for platform (#650) (05814243)
- name field on locator filters (#649) (44c83577)

##### Other Changes

- false (#690) (ab7bfdb7)

##### Refactors

- use slots for grid (#696) (3fc3cdf0)
- resolve translations and entity fields together (#652) (cb6ed71d)
- switch to awesome-phonenumber (#653) (451413ee)

#### 0.0.50 (2025-07-18)

##### Bug Fixes

- replace const { document } = useDocument(); (#648) (3455b317)

#### 0.0.49 (2025-07-17)

##### Bug Fixes

- use old constant value input for string lists (#647) (3fe13904)
- useDocument instead of document args (#646) (9e45112c)

#### 0.0.48 (2025-07-17)

##### Chores

- fix issues caused by merges (#635) (b4708a00)
- more Directory and PageSection tests (#612) (1a6ecd8a)
- add tests for static map and reviews (#628) (fba1f5a1)
- wait for image load in component tests (#620) (99e4859c)
- add tests for NearbyLocations and Locator (#624) (be8f6faa)
- fix unit test action vulnerability 2 (#625) (bbe6cbcf)
- expanded footer tests (#621) (73519086)
- tests for ExpandedHeader (#613) (971c015f)
- unit test action vulnerability (#617) (edf80bf8)

##### New Features

- add Title prop to Directory component (#595) (06391873)
- add variant for all CTA's (#639) (570e3153)
- normalize locales (#630) (ac8ea89b)
- add entity field embedding to constant fields (#582) (1662f1d5)
- resolve embedded fields in constant values (#614) (82512790)
- copy/paste component data (#618) (3839963d)

##### Bug Fixes

- pass the correct document to resolveTranslatableString (#643) (7896e887)
- resolved embedded fields in resolveTranslatableString (#642) (0e15252f)
- change "zh-CN" to "zh" (#638) (15cf4de9)
- lint and i18n (#640) (4b8419e8)
- expanded header migration (#627) (42324170)
- cleanup release json error (#633) (c102580c)
- install pkg.pr.new package (#629) (f6b94e94)
- dark background handling for brand colors (#631) (ecf51494)
- minor UI fixes and updated social validations in ExpandedFooter (#619) (6ccf7db8)
- image rendering on live page (#623) (e12cca9d)

##### Refactors

- run component tests on playwright docker image (#603) (4c8540ed)
- filter current location from nearbyLocations (#616) (edc62161)

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
