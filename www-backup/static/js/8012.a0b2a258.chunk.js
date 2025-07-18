/*! For license information please see 8012.a0b2a258.chunk.js.LICENSE.txt */
"use strict";(self.webpackChunkorne_dapp=self.webpackChunkorne_dapp||[]).push([[8012],{7836:(t,e,i)=>{var n=i(37022),o=i(38117),a=i(41286),r=i(39446),s=i(37845);const c=n.AH`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var l=function(t,e,i,n){var o,a=arguments.length,r=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(r=(a<3?o(r):a>3?o(e,i,r):o(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};let h=class extends n.WF{constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){const t={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`\n      --local-align: ${this.align};\n      --local-color: var(--wui-color-${this.color});\n    `,n.qy`<slot class=${(0,a.H)(t)}></slot>`}};h.styles=[r.W5,c],l([(0,o.MZ)()],h.prototype,"variant",void 0),l([(0,o.MZ)()],h.prototype,"color",void 0),l([(0,o.MZ)()],h.prototype,"align",void 0),l([(0,o.MZ)()],h.prototype,"lineClamp",void 0),h=l([(0,s.E)("wui-text")],h)},10477:(t,e,i)=>{i(61446)},23723:(t,e,i)=>{var n=i(37022),o=i(38117),a=i(39446),r=i(37845);const s=n.AH`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 2s linear infinite;
  }

  circle {
    fill: none;
    stroke: var(--local-color);
    stroke-width: 4px;
    stroke-dasharray: 1, 124;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 124;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 90, 124;
      stroke-dashoffset: -35;
    }

    100% {
      stroke-dashoffset: -125;
    }
  }
`;var c=function(t,e,i,n){var o,a=arguments.length,r=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(r=(a<3?o(r):a>3?o(e,i,r):o(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};let l=class extends n.WF{constructor(){super(...arguments),this.color="accent-100",this.size="lg"}render(){return this.style.cssText="--local-color: "+("inherit"===this.color?"inherit":`var(--wui-color-${this.color})`),this.dataset.size=this.size,n.qy`<svg viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`}};l.styles=[a.W5,s],c([(0,o.MZ)()],l.prototype,"color",void 0),c([(0,o.MZ)()],l.prototype,"size",void 0),l=c([(0,r.E)("wui-loading-spinner")],l)},29319:(t,e,i)=>{var n=i(37022),o=i(38117),a=(i(7836),i(39446)),r=i(37845);const s=n.AH`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--wui-spacing-m);
    padding: 0 var(--wui-spacing-3xs) !important;
    border-radius: var(--wui-border-radius-5xs);
    transition:
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius, background-color;
  }

  :host > wui-text {
    transform: translateY(5%);
  }

  :host([data-variant='main']) {
    background-color: var(--wui-color-accent-glass-015);
    color: var(--wui-color-accent-100);
  }

  :host([data-variant='shade']) {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-200);
  }

  :host([data-variant='success']) {
    background-color: var(--wui-icon-box-bg-success-100);
    color: var(--wui-color-success-100);
  }

  :host([data-variant='error']) {
    background-color: var(--wui-icon-box-bg-error-100);
    color: var(--wui-color-error-100);
  }

  :host([data-size='lg']) {
    padding: 11px 5px !important;
  }

  :host([data-size='lg']) > wui-text {
    transform: translateY(2%);
  }
`;var c=function(t,e,i,n){var o,a=arguments.length,r=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(r=(a<3?o(r):a>3?o(e,i,r):o(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};let l=class extends n.WF{constructor(){super(...arguments),this.variant="main",this.size="lg"}render(){this.dataset.variant=this.variant,this.dataset.size=this.size;const t="md"===this.size?"mini-700":"micro-700";return n.qy`
      <wui-text data-variant=${this.variant} variant=${t} color="inherit">
        <slot></slot>
      </wui-text>
    `}};l.styles=[a.W5,s],c([(0,o.MZ)()],l.prototype,"variant",void 0),c([(0,o.MZ)()],l.prototype,"size",void 0),l=c([(0,r.E)("wui-tag")],l)},30533:(t,e,i)=>{i.d(e,{OA:()=>n,WL:()=>a,u$:()=>o});const n={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},o=t=>function(){for(var e=arguments.length,i=new Array(e),n=0;n<e;n++)i[n]=arguments[n];return{_$litDirective$:t,values:i}};class a{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}},38117:(t,e,i)=>{i.d(e,{MZ:()=>r,wk:()=>s});var n=i(46830);const o={attribute:!0,type:String,converter:n.W3,reflect:!1,hasChanged:n.Ec},a=function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:o,e=arguments.length>1?arguments[1]:void 0,i=arguments.length>2?arguments[2]:void 0;const{kind:n,metadata:a}=i;let r=globalThis.litPropertyMetadata.get(a);if(void 0===r&&globalThis.litPropertyMetadata.set(a,r=new Map),"setter"===n&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===n){const{name:n}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(n,o,t)},init(e){return void 0!==e&&this.C(n,void 0,t,e),e}}}if("setter"===n){const{name:n}=i;return function(i){const o=this[n];e.call(this,i),this.requestUpdate(n,o,t)}}throw Error("Unsupported decorator location: "+n)};function r(t){return(e,i)=>"object"==typeof i?a(t,e,i):((t,e,i)=>{const n=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),n?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function s(t){return r({...t,state:!0,attribute:!1})}},41286:(t,e,i)=>{i.d(e,{H:()=>a});var n=i(28531),o=i(30533);const a=(0,o.u$)(class extends o.WL{constructor(t){if(super(t),t.type!==o.OA.ATTRIBUTE||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,e){let[i]=e;if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in i)i[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(i)}const o=t.element.classList;for(const n of this.st)n in i||(o.remove(n),this.st.delete(n));for(const n in i){const t=!!i[n];t===this.st.has(n)||this.nt?.has(n)||(t?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return n.c0}})},44952:(t,e,i)=>{i.d(e,{Kq:()=>d});var n=i(70885),o=i(30533);const a=(t,e)=>{const i=t._$AN;if(void 0===i)return!1;for(const n of i)n._$AO?.(e,!1),a(n,e);return!0},r=t=>{let e,i;do{if(void 0===(e=t._$AM))break;i=e._$AN,i.delete(t),t=e}while(0===i?.size)},s=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(void 0===i)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),h(e)}};function c(t){void 0!==this._$AN?(r(this),this._$AM=t,s(this)):this._$AM=t}function l(t){let e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;const n=this._$AH,o=this._$AN;if(void 0!==o&&0!==o.size)if(e)if(Array.isArray(n))for(let s=i;s<n.length;s++)a(n[s],!1),r(n[s]);else null!=n&&(a(n,!1),r(n));else a(this,t)}const h=t=>{t.type==o.OA.CHILD&&(t._$AP??=l,t._$AQ??=c)};class d extends o.WL{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,i){super._$AT(t,e,i),s(this),this.isConnected=t._$AU}_$AO(t){let e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(a(this,t),r(this))}setValue(t){if((0,n.Rt)(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}},52574:(t,e,i)=>{var n=i(37022),o=i(38117),a=i(39446),r=i(69929),s=i(37845);const c=n.AH`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var l=function(t,e,i,n){var o,a=arguments.length,r=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(r=(a<3?o(r):a>3?o(e,i,r):o(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};let h=class extends n.WF{render(){return this.style.cssText=`\n      flex-direction: ${this.flexDirection};\n      flex-wrap: ${this.flexWrap};\n      flex-basis: ${this.flexBasis};\n      flex-grow: ${this.flexGrow};\n      flex-shrink: ${this.flexShrink};\n      align-items: ${this.alignItems};\n      justify-content: ${this.justifyContent};\n      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};\n      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};\n      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};\n      padding-top: ${this.padding&&r.Z.getSpacingStyles(this.padding,0)};\n      padding-right: ${this.padding&&r.Z.getSpacingStyles(this.padding,1)};\n      padding-bottom: ${this.padding&&r.Z.getSpacingStyles(this.padding,2)};\n      padding-left: ${this.padding&&r.Z.getSpacingStyles(this.padding,3)};\n      margin-top: ${this.margin&&r.Z.getSpacingStyles(this.margin,0)};\n      margin-right: ${this.margin&&r.Z.getSpacingStyles(this.margin,1)};\n      margin-bottom: ${this.margin&&r.Z.getSpacingStyles(this.margin,2)};\n      margin-left: ${this.margin&&r.Z.getSpacingStyles(this.margin,3)};\n    `,n.qy`<slot></slot>`}};h.styles=[a.W5,c],l([(0,o.MZ)()],h.prototype,"flexDirection",void 0),l([(0,o.MZ)()],h.prototype,"flexWrap",void 0),l([(0,o.MZ)()],h.prototype,"flexBasis",void 0),l([(0,o.MZ)()],h.prototype,"flexGrow",void 0),l([(0,o.MZ)()],h.prototype,"flexShrink",void 0),l([(0,o.MZ)()],h.prototype,"alignItems",void 0),l([(0,o.MZ)()],h.prototype,"justifyContent",void 0),l([(0,o.MZ)()],h.prototype,"columnGap",void 0),l([(0,o.MZ)()],h.prototype,"rowGap",void 0),l([(0,o.MZ)()],h.prototype,"gap",void 0),l([(0,o.MZ)()],h.prototype,"padding",void 0),l([(0,o.MZ)()],h.prototype,"margin",void 0),h=l([(0,s.E)("wui-flex")],h)},56440:(t,e,i)=>{i.d(e,{J:()=>o});var n=i(28531);const o=t=>t??n.s6},61446:(t,e,i)=>{var n=i(37022),o=i(38117),a=i(28531),r=i(70885),s=i(44952);class c{constructor(t){this.G=t}disconnect(){this.G=void 0}reconnect(t){this.G=t}deref(){return this.G}}class l{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??=new Promise(t=>this.Z=t)}resume(){this.Z?.(),this.Y=this.Z=void 0}}var h=i(30533);const d=t=>!(0,r.sO)(t)&&"function"==typeof t.then,g=1073741823;class p extends s.Kq{constructor(){super(...arguments),this._$Cwt=g,this._$Cbt=[],this._$CK=new c(this),this._$CX=new l}render(){for(var t=arguments.length,e=new Array(t),i=0;i<t;i++)e[i]=arguments[i];return e.find(t=>!d(t))??a.c0}update(t,e){const i=this._$Cbt;let n=i.length;this._$Cbt=e;const o=this._$CK,r=this._$CX;this.isConnected||this.disconnected();for(let a=0;a<e.length&&!(a>this._$Cwt);a++){const t=e[a];if(!d(t))return this._$Cwt=a,t;a<n&&t===i[a]||(this._$Cwt=g,n=0,Promise.resolve(t).then(async e=>{for(;r.get();)await r.get();const i=o.deref();if(void 0!==i){const n=i._$Cbt.indexOf(t);n>-1&&n<i._$Cwt&&(i._$Cwt=n,i.setValue(e))}}))}return a.c0}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}const w=(0,h.u$)(p);const u=new class{constructor(){this.cache=new Map}set(t,e){this.cache.set(t,e)}get(t){return this.cache.get(t)}has(t){return this.cache.has(t)}delete(t){this.cache.delete(t)}clear(){this.cache.clear()}};var v=i(39446),f=i(37845);const y=n.AH`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var b=function(t,e,i,n){var o,a=arguments.length,r=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(r=(a<3?o(r):a>3?o(e,i,r):o(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};const m={add:async()=>(await i.e(4661).then(i.bind(i,94661))).addSvg,allWallets:async()=>(await i.e(4310).then(i.bind(i,34310))).allWalletsSvg,arrowBottomCircle:async()=>(await i.e(752).then(i.bind(i,30752))).arrowBottomCircleSvg,appStore:async()=>(await i.e(9729).then(i.bind(i,99729))).appStoreSvg,apple:async()=>(await i.e(2926).then(i.bind(i,62926))).appleSvg,arrowBottom:async()=>(await i.e(9539).then(i.bind(i,39539))).arrowBottomSvg,arrowLeft:async()=>(await i.e(5333).then(i.bind(i,75333))).arrowLeftSvg,arrowRight:async()=>(await i.e(1284).then(i.bind(i,21284))).arrowRightSvg,arrowTop:async()=>(await i.e(9053).then(i.bind(i,49053))).arrowTopSvg,bank:async()=>(await i.e(1542).then(i.bind(i,51542))).bankSvg,browser:async()=>(await i.e(7654).then(i.bind(i,67654))).browserSvg,card:async()=>(await i.e(4682).then(i.bind(i,74682))).cardSvg,checkmark:async()=>(await i.e(9075).then(i.bind(i,79075))).checkmarkSvg,checkmarkBold:async()=>(await i.e(6003).then(i.bind(i,56003))).checkmarkBoldSvg,chevronBottom:async()=>(await i.e(2821).then(i.bind(i,62821))).chevronBottomSvg,chevronLeft:async()=>(await i.e(2415).then(i.bind(i,12415))).chevronLeftSvg,chevronRight:async()=>(await i.e(526).then(i.bind(i,50526))).chevronRightSvg,chevronTop:async()=>(await i.e(9867).then(i.bind(i,69867))).chevronTopSvg,chromeStore:async()=>(await i.e(5710).then(i.bind(i,95710))).chromeStoreSvg,clock:async()=>(await i.e(5656).then(i.bind(i,75656))).clockSvg,close:async()=>(await i.e(7942).then(i.bind(i,47942))).closeSvg,compass:async()=>(await i.e(3430).then(i.bind(i,93430))).compassSvg,coinPlaceholder:async()=>(await i.e(5596).then(i.bind(i,65596))).coinPlaceholderSvg,copy:async()=>(await i.e(4625).then(i.bind(i,24625))).copySvg,cursor:async()=>(await i.e(1854).then(i.bind(i,71854))).cursorSvg,cursorTransparent:async()=>(await i.e(101).then(i.bind(i,50101))).cursorTransparentSvg,desktop:async()=>(await i.e(8926).then(i.bind(i,88926))).desktopSvg,disconnect:async()=>(await i.e(4246).then(i.bind(i,34246))).disconnectSvg,discord:async()=>(await i.e(7134).then(i.bind(i,57134))).discordSvg,etherscan:async()=>(await i.e(5311).then(i.bind(i,15311))).etherscanSvg,extension:async()=>(await i.e(1519).then(i.bind(i,81519))).extensionSvg,externalLink:async()=>(await i.e(4004).then(i.bind(i,94004))).externalLinkSvg,facebook:async()=>(await i.e(1520).then(i.bind(i,51520))).facebookSvg,farcaster:async()=>(await i.e(8007).then(i.bind(i,98007))).farcasterSvg,filters:async()=>(await i.e(8817).then(i.bind(i,28817))).filtersSvg,github:async()=>(await i.e(2011).then(i.bind(i,52011))).githubSvg,google:async()=>(await i.e(1487).then(i.bind(i,11487))).googleSvg,helpCircle:async()=>(await i.e(5024).then(i.bind(i,5024))).helpCircleSvg,image:async()=>(await i.e(1131).then(i.bind(i,31131))).imageSvg,id:async()=>(await i.e(3005).then(i.bind(i,73005))).idSvg,infoCircle:async()=>(await i.e(1925).then(i.bind(i,91925))).infoCircleSvg,lightbulb:async()=>(await i.e(3697).then(i.bind(i,43697))).lightbulbSvg,mail:async()=>(await i.e(5911).then(i.bind(i,55911))).mailSvg,mobile:async()=>(await i.e(6426).then(i.bind(i,26426))).mobileSvg,more:async()=>(await i.e(1525).then(i.bind(i,91525))).moreSvg,networkPlaceholder:async()=>(await i.e(3656).then(i.bind(i,83656))).networkPlaceholderSvg,nftPlaceholder:async()=>(await i.e(8417).then(i.bind(i,48417))).nftPlaceholderSvg,off:async()=>(await i.e(6243).then(i.bind(i,96243))).offSvg,playStore:async()=>(await i.e(5010).then(i.bind(i,5010))).playStoreSvg,plus:async()=>(await i.e(792).then(i.bind(i,70792))).plusSvg,qrCode:async()=>(await i.e(3137).then(i.bind(i,43137))).qrCodeIcon,recycleHorizontal:async()=>(await i.e(4500).then(i.bind(i,24500))).recycleHorizontalSvg,refresh:async()=>(await i.e(6629).then(i.bind(i,76629))).refreshSvg,search:async()=>(await i.e(4708).then(i.bind(i,4708))).searchSvg,send:async()=>(await i.e(6970).then(i.bind(i,36970))).sendSvg,swapHorizontal:async()=>(await i.e(7751).then(i.bind(i,37751))).swapHorizontalSvg,swapHorizontalMedium:async()=>(await i.e(3596).then(i.bind(i,63596))).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await i.e(3448).then(i.bind(i,83448))).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await i.e(6749).then(i.bind(i,56749))).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await i.e(3293).then(i.bind(i,3293))).swapVerticalSvg,telegram:async()=>(await i.e(6495).then(i.bind(i,16495))).telegramSvg,threeDots:async()=>(await i.e(395).then(i.bind(i,40395))).threeDotsSvg,twitch:async()=>(await i.e(4931).then(i.bind(i,64931))).twitchSvg,twitter:async()=>(await i.e(8606).then(i.bind(i,8606))).xSvg,twitterIcon:async()=>(await i.e(900).then(i.bind(i,40900))).twitterIconSvg,verify:async()=>(await i.e(9197).then(i.bind(i,99197))).verifySvg,verifyFilled:async()=>(await i.e(7610).then(i.bind(i,97610))).verifyFilledSvg,wallet:async()=>(await i.e(6549).then(i.bind(i,78930))).walletSvg,walletConnect:async()=>(await i.e(2463).then(i.bind(i,52463))).walletConnectSvg,walletConnectLightBrown:async()=>(await i.e(2463).then(i.bind(i,52463))).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await i.e(2463).then(i.bind(i,52463))).walletConnectBrownSvg,walletPlaceholder:async()=>(await i.e(7069).then(i.bind(i,57069))).walletPlaceholderSvg,warningCircle:async()=>(await i.e(8471).then(i.bind(i,18471))).warningCircleSvg,x:async()=>(await i.e(8606).then(i.bind(i,8606))).xSvg,info:async()=>(await i.e(88).then(i.bind(i,50088))).infoSvg,exclamationTriangle:async()=>(await i.e(2784).then(i.bind(i,92784))).exclamationTriangleSvg,reown:async()=>(await i.e(7217).then(i.bind(i,47217))).reownSvg};let $=class extends n.WF{constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`\n      --local-color: var(--wui-color-${this.color});\n      --local-width: var(--wui-icon-size-${this.size});\n      --local-aspect-ratio: ${this.aspectRatio}\n    `,n.qy`${w(async function(t){if(u.has(t))return u.get(t);const e=(m[t]??m.copy)();return u.set(t,e),e}(this.name),n.qy`<div class="fallback"></div>`)}`}};$.styles=[v.W5,v.ck,y],b([(0,o.MZ)()],$.prototype,"size",void 0),b([(0,o.MZ)()],$.prototype,"name",void 0),b([(0,o.MZ)()],$.prototype,"color",void 0),b([(0,o.MZ)()],$.prototype,"aspectRatio",void 0),$=b([(0,f.E)("wui-icon")],$)},70885:(t,e,i)=>{i.d(e,{Rt:()=>r,sO:()=>a});var n=i(28531);const{I:o}=n.ge,a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,r=t=>void 0===t.strings},71056:(t,e,i)=>{var n=i(37022),o=i(38117),a=i(39446),r=i(37845);const s=n.AH`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
  }
`;var c=function(t,e,i,n){var o,a=arguments.length,r=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(r=(a<3?o(r):a>3?o(e,i,r):o(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};let l=class extends n.WF{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0}render(){return this.style.cssText=`\n      --local-width: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};\n      --local-height: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};\n      `,n.qy`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};l.styles=[a.W5,a.ck,s],c([(0,o.MZ)()],l.prototype,"src",void 0),c([(0,o.MZ)()],l.prototype,"alt",void 0),c([(0,o.MZ)()],l.prototype,"size",void 0),l=c([(0,r.E)("wui-image")],l)},84107:(t,e,i)=>{i(52574)},84875:(t,e,i)=>{i(7836)},90702:(t,e,i)=>{var n=i(37022),o=i(38117),a=(i(61446),i(39446)),r=i(37845);const s=n.AH`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background-color: var(--wui-color-gray-glass-020);
    border-radius: var(--local-border-radius);
    border: var(--local-border);
    box-sizing: content-box;
    width: var(--local-size);
    height: var(--local-size);
    min-height: var(--local-size);
    min-width: var(--local-size);
  }

  @supports (background: color-mix(in srgb, white 50%, black)) {
    :host {
      background-color: color-mix(in srgb, var(--local-bg-value) var(--local-bg-mix), transparent);
    }
  }
`;var c=function(t,e,i,n){var o,a=arguments.length,r=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(r=(a<3?o(r):a>3?o(e,i,r):o(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};let l=class extends n.WF{constructor(){super(...arguments),this.size="md",this.backgroundColor="accent-100",this.iconColor="accent-100",this.background="transparent",this.border=!1,this.borderColor="wui-color-bg-125",this.icon="copy"}render(){const t=this.iconSize||this.size,e="lg"===this.size,i="xl"===this.size,o=e?"12%":"16%",a=e?"xxs":i?"s":"3xl",r="gray"===this.background,s="opaque"===this.background,c="accent-100"===this.backgroundColor&&s||"success-100"===this.backgroundColor&&s||"error-100"===this.backgroundColor&&s||"inverse-100"===this.backgroundColor&&s;let l=`var(--wui-color-${this.backgroundColor})`;return c?l=`var(--wui-icon-box-bg-${this.backgroundColor})`:r&&(l=`var(--wui-color-gray-${this.backgroundColor})`),this.style.cssText=`\n       --local-bg-value: ${l};\n       --local-bg-mix: ${c||r?"100%":o};\n       --local-border-radius: var(--wui-border-radius-${a});\n       --local-size: var(--wui-icon-box-size-${this.size});\n       --local-border: ${"wui-color-bg-125"===this.borderColor?"2px":"1px"} solid ${this.border?`var(--${this.borderColor})`:"transparent"}\n   `,n.qy` <wui-icon color=${this.iconColor} size=${t} name=${this.icon}></wui-icon> `}};l.styles=[a.W5,a.fD,s],c([(0,o.MZ)()],l.prototype,"size",void 0),c([(0,o.MZ)()],l.prototype,"backgroundColor",void 0),c([(0,o.MZ)()],l.prototype,"iconColor",void 0),c([(0,o.MZ)()],l.prototype,"iconSize",void 0),c([(0,o.MZ)()],l.prototype,"background",void 0),c([(0,o.MZ)({type:Boolean})],l.prototype,"border",void 0),c([(0,o.MZ)()],l.prototype,"borderColor",void 0),c([(0,o.MZ)()],l.prototype,"icon",void 0),l=c([(0,r.E)("wui-icon-box")],l)}}]);
//# sourceMappingURL=8012.a0b2a258.chunk.js.map