"use strict";const e=require("../common/vendor.js"),n=e.defineStore("counter",(()=>{const n=e.ref(0);return{count:n,increment:function(){n.value++}}}));exports.useCounterStore=n;
