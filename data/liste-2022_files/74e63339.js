import{S as t,i as e,n as s,e as i,v as l,a as r,b as o,x as a,f as n,o as c,g as h,z as p,t as g,p as m,j as v,q as f,w as u,y as d,B as $,c as b,L as w,d as x,m as E,k as I,J as y}from"./61b97c49.js";import{I as D}from"./4419f99f.js";import{P as V}from"./64452f45.js";function A(t,e,s){const i=t.slice();return i[3]=e[s],i}function T(t,e,s){const i=t.slice();return i[3]=e[s],i}function O(t){let e,s,l=t[0].heading+"";return{c(){e=i("h2"),s=u(l),this.h()},l(t){e=r(t,"H2",{class:!0});var i=o(e);s=d(i,l),i.forEach(n),this.h()},h(){c(e,"class","heading-1")},m(t,i){h(t,e,i),p(e,s)},p(t,e){1&e&&l!==(l=t[0].heading+"")&&$(s,l)},d(t){t&&n(e)}}}function P(t){let e,s,y,V,A,T,O,P,L,S,H,R,B,M,q,z,J,C,F=t[0].items[0].description+"",G=t[0].items[0].title+"";V=new D({props:{data:{alt:t[0].items[0].image.description,src:t[0].items[0].image.src,type:"STANDARD",bildId:t[0].items[0].image.bildId,copyright:t[0].items[0].image.copyright,tooltipOrientation:"TOP",sourceset:[{viewport:"810px",resolution:800},{viewport:"700px",resolution:500},{resolution:384}]}}});let K=t[0].items.length>1&&k(t),Q=t[0].items.length>5&&N(t),U=t[0].items.length>5&&j(t);return{c(){e=i("div"),s=i("div"),y=i("div"),b(V.$$.fragment),A=l(),T=i("div"),O=i("p"),P=u(F),L=l(),S=i("h3"),H=i("a"),R=u(G),M=l(),K&&K.c(),q=l(),Q&&Q.c(),z=l(),U&&U.c(),J=w(),this.h()},l(t){e=r(t,"DIV",{class:!0});var i=o(e);s=r(i,"DIV",{class:!0});var l=o(s);y=r(l,"DIV",{class:!0});var c=o(y);x(V.$$.fragment,c),A=a(c),T=r(c,"DIV",{class:!0});var h=o(T);O=r(h,"P",{class:!0});var p=o(O);P=d(p,F),p.forEach(n),L=a(h),S=r(h,"H3",{class:!0});var g=o(S);H=r(g,"A",{href:!0,class:!0});var m=o(H);R=d(m,G),m.forEach(n),g.forEach(n),h.forEach(n),c.forEach(n),M=a(l),K&&K.l(l),l.forEach(n),i.forEach(n),q=a(t),Q&&Q.l(t),z=a(t),U&&U.l(t),J=w(),this.h()},h(){c(O,"class","svelte-sv0tbg"),c(H,"href",B=t[0].items[0].link),c(H,"class","svelte-sv0tbg"),c(S,"class","svelte-sv0tbg"),c(T,"class","box svelte-sv0tbg"),c(y,"class","item svelte-sv0tbg"),c(s,"class","row svelte-sv0tbg"),c(e,"class","results svelte-sv0tbg")},m(t,i){h(t,e,i),p(e,s),p(s,y),E(V,y,null),p(y,A),p(y,T),p(T,O),p(O,P),p(T,L),p(T,S),p(S,H),p(H,R),p(s,M),K&&K.m(s,null),h(t,q,i),Q&&Q.m(t,i),h(t,z,i),U&&U.m(t,i),h(t,J,i),C=!0},p(t,e){const i={};1&e&&(i.data={alt:t[0].items[0].image.description,src:t[0].items[0].image.src,type:"STANDARD",bildId:t[0].items[0].image.bildId,copyright:t[0].items[0].image.copyright,tooltipOrientation:"TOP",sourceset:[{viewport:"810px",resolution:800},{viewport:"700px",resolution:500},{resolution:384}]}),V.$set(i),(!C||1&e)&&F!==(F=t[0].items[0].description+"")&&$(P,F),(!C||1&e)&&G!==(G=t[0].items[0].title+"")&&$(R,G),(!C||1&e&&B!==(B=t[0].items[0].link))&&c(H,"href",B),t[0].items.length>1?K?(K.p(t,e),1&e&&g(K,1)):(K=k(t),K.c(),g(K,1),K.m(s,null)):K&&(m(),v(K,1,1,(()=>{K=null})),f()),t[0].items.length>5?Q?(Q.p(t,e),1&e&&g(Q,1)):(Q=N(t),Q.c(),g(Q,1),Q.m(z.parentNode,z)):Q&&(m(),v(Q,1,1,(()=>{Q=null})),f()),t[0].items.length>5?U?(U.p(t,e),1&e&&g(U,1)):(U=j(t),U.c(),g(U,1),U.m(J.parentNode,J)):U&&(m(),v(U,1,1,(()=>{U=null})),f())},i(t){C||(g(V.$$.fragment,t),g(K),g(Q),g(U),C=!0)},o(t){v(V.$$.fragment,t),v(K),v(Q),v(U),C=!1},d(t){t&&n(e),I(V),K&&K.d(),t&&n(q),Q&&Q.d(t),t&&n(z),U&&U.d(t),t&&n(J)}}}function k(t){let e,s,l,a=t[0].items.slice(1,5),u=[];for(let e=0;e<a.length;e+=1)u[e]=L(T(t,a,e));const d=t=>v(u[t],1,1,(()=>{u[t]=null}));return{c(){e=i("div"),s=i("div");for(let t=0;t<u.length;t+=1)u[t].c();this.h()},l(t){e=r(t,"DIV",{class:!0});var i=o(e);s=r(i,"DIV",{class:!0});var l=o(s);for(let t=0;t<u.length;t+=1)u[t].l(l);l.forEach(n),i.forEach(n),this.h()},h(){c(s,"class","svelte-sv0tbg"),c(e,"class","grid svelte-sv0tbg")},m(t,i){h(t,e,i),p(e,s);for(let t=0;t<u.length;t+=1)u[t].m(s,null);l=!0},p(t,e){if(1&e){let i;for(a=t[0].items.slice(1,5),i=0;i<a.length;i+=1){const l=T(t,a,i);u[i]?(u[i].p(l,e),g(u[i],1)):(u[i]=L(l),u[i].c(),g(u[i],1),u[i].m(s,null))}for(m(),i=a.length;i<u.length;i+=1)d(i);f()}},i(t){if(!l){for(let t=0;t<a.length;t+=1)g(u[t]);l=!0}},o(t){u=u.filter(Boolean);for(let t=0;t<u.length;t+=1)v(u[t]);l=!1},d(t){t&&n(e),y(u,t)}}}function L(t){let e,s,m,f,w,y,V,A,T,O,P,k,L,N=t[3].description+"",S=t[3].title+"";return s=new D({props:{data:{alt:t[3].image.description,src:t[3].image.src,type:"STANDARD",tooltipOrientation:"TOP",bildId:t[3].image.bildId,copyright:t[3].image.copyright,sourceset:[{viewport:"1200px",resolution:800},{viewport:"1000px",resolution:500},{viewport:"810px",resolution:384},{viewport:"600px",resolution:800},{viewport:"480px",resolution:500},{resolution:384}]}}}),{c(){e=i("div"),b(s.$$.fragment),m=l(),f=i("div"),w=i("p"),y=u(N),V=l(),A=i("h3"),T=i("a"),O=u(S),k=l(),this.h()},l(t){e=r(t,"DIV",{class:!0});var i=o(e);x(s.$$.fragment,i),m=a(i),f=r(i,"DIV",{class:!0});var l=o(f);w=r(l,"P",{class:!0});var c=o(w);y=d(c,N),c.forEach(n),V=a(l),A=r(l,"H3",{class:!0});var h=o(A);T=r(h,"A",{href:!0,class:!0});var p=o(T);O=d(p,S),p.forEach(n),h.forEach(n),l.forEach(n),k=a(i),i.forEach(n),this.h()},h(){c(w,"class","svelte-sv0tbg"),c(T,"href",P=t[3].link),c(T,"class","svelte-sv0tbg"),c(A,"class","svelte-sv0tbg"),c(f,"class","box small svelte-sv0tbg"),c(e,"class","item svelte-sv0tbg")},m(t,i){h(t,e,i),E(s,e,null),p(e,m),p(e,f),p(f,w),p(w,y),p(f,V),p(f,A),p(A,T),p(T,O),p(e,k),L=!0},p(t,e){const i={};1&e&&(i.data={alt:t[3].image.description,src:t[3].image.src,type:"STANDARD",tooltipOrientation:"TOP",bildId:t[3].image.bildId,copyright:t[3].image.copyright,sourceset:[{viewport:"1200px",resolution:800},{viewport:"1000px",resolution:500},{viewport:"810px",resolution:384},{viewport:"600px",resolution:800},{viewport:"480px",resolution:500},{resolution:384}]}),s.$set(i),(!L||1&e)&&N!==(N=t[3].description+"")&&$(y,N),(!L||1&e)&&S!==(S=t[3].title+"")&&$(O,S),(!L||1&e&&P!==(P=t[3].link))&&c(T,"href",P)},i(t){L||(g(s.$$.fragment,t),L=!0)},o(t){v(s.$$.fragment,t),L=!1},d(t){t&&n(e),I(s)}}}function N(t){let e,s,l=t[0].items.slice(5,t[1]),a=[];for(let e=0;e<l.length;e+=1)a[e]=S(A(t,l,e));const p=t=>v(a[t],1,1,(()=>{a[t]=null}));return{c(){e=i("div");for(let t=0;t<a.length;t+=1)a[t].c();this.h()},l(t){e=r(t,"DIV",{class:!0});var s=o(e);for(let t=0;t<a.length;t+=1)a[t].l(s);s.forEach(n),this.h()},h(){c(e,"class","more-grid svelte-sv0tbg")},m(t,i){h(t,e,i);for(let t=0;t<a.length;t+=1)a[t].m(e,null);s=!0},p(t,s){if(3&s){let i;for(l=t[0].items.slice(5,t[1]),i=0;i<l.length;i+=1){const r=A(t,l,i);a[i]?(a[i].p(r,s),g(a[i],1)):(a[i]=S(r),a[i].c(),g(a[i],1),a[i].m(e,null))}for(m(),i=l.length;i<a.length;i+=1)p(i);f()}},i(t){if(!s){for(let t=0;t<l.length;t+=1)g(a[t]);s=!0}},o(t){a=a.filter(Boolean);for(let t=0;t<a.length;t+=1)v(a[t]);s=!1},d(t){t&&n(e),y(a,t)}}}function S(t){let e,s,m,f,w,y,V,A,T,O,P,k,L,N=t[3].description+"",S=t[3].title+"";return s=new D({props:{data:{alt:t[3].image.description,src:t[3].image.src,copyright:t[3].image.copyright,sourceset:[{viewport:"1200px",resolution:800},{viewport:"1000px",resolution:500},{viewport:"810px",resolution:384},{viewport:"600px",resolution:800},{viewport:"480px",resolution:500},{resolution:384}]}}}),{c(){e=i("div"),b(s.$$.fragment),m=l(),f=i("div"),w=i("p"),y=u(N),V=l(),A=i("h3"),T=i("a"),O=u(S),k=l(),this.h()},l(t){e=r(t,"DIV",{class:!0});var i=o(e);x(s.$$.fragment,i),m=a(i),f=r(i,"DIV",{class:!0});var l=o(f);w=r(l,"P",{class:!0});var c=o(w);y=d(c,N),c.forEach(n),V=a(l),A=r(l,"H3",{class:!0});var h=o(A);T=r(h,"A",{href:!0,class:!0});var p=o(T);O=d(p,S),p.forEach(n),h.forEach(n),l.forEach(n),k=a(i),i.forEach(n),this.h()},h(){c(w,"class","svelte-sv0tbg"),c(T,"href",P=t[3].link),c(T,"class","svelte-sv0tbg"),c(A,"class","svelte-sv0tbg"),c(f,"class","box small svelte-sv0tbg"),c(e,"class","item svelte-sv0tbg")},m(t,i){h(t,e,i),E(s,e,null),p(e,m),p(e,f),p(f,w),p(w,y),p(f,V),p(f,A),p(A,T),p(T,O),p(e,k),L=!0},p(t,e){const i={};3&e&&(i.data={alt:t[3].image.description,src:t[3].image.src,copyright:t[3].image.copyright,sourceset:[{viewport:"1200px",resolution:800},{viewport:"1000px",resolution:500},{viewport:"810px",resolution:384},{viewport:"600px",resolution:800},{viewport:"480px",resolution:500},{resolution:384}]}),s.$set(i),(!L||3&e)&&N!==(N=t[3].description+"")&&$(y,N),(!L||3&e)&&S!==(S=t[3].title+"")&&$(O,S),(!L||3&e&&P!==(P=t[3].link))&&c(T,"href",P)},i(t){L||(g(s.$$.fragment,t),L=!0)},o(t){v(s.$$.fragment,t),L=!1},d(t){t&&n(e),I(s)}}}function j(t){let e,s;return e=new V({props:{displayLength:t[1],displayLengthModifier:5,resultLength:t[0].items.length}}),e.$on("more",t[2]),{c(){b(e.$$.fragment)},l(t){x(e.$$.fragment,t)},m(t,i){E(e,t,i),s=!0},p(t,s){const i={};2&s&&(i.displayLength=t[1]),1&s&&(i.resultLength=t[0].items.length),e.$set(i)},i(t){s||(g(e.$$.fragment,t),s=!0)},o(t){v(e.$$.fragment,t),s=!1},d(t){I(e,t)}}}function H(t){let e,s,u,d=t[0].heading&&O(t),$=t[0].items&&t[0].items.length&&P(t);return{c(){e=i("div"),d&&d.c(),s=l(),$&&$.c(),this.h()},l(t){e=r(t,"DIV",{class:!0});var i=o(e);d&&d.l(i),s=a(i),$&&$.l(i),i.forEach(n),this.h()},h(){c(e,"class","highlight topics-section contentElement svelte-sv0tbg")},m(t,i){h(t,e,i),d&&d.m(e,null),p(e,s),$&&$.m(e,null),u=!0},p(t,[i]){t[0].heading?d?d.p(t,i):(d=O(t),d.c(),d.m(e,s)):d&&(d.d(1),d=null),t[0].items&&t[0].items.length?$?($.p(t,i),1&i&&g($,1)):($=P(t),$.c(),g($,1),$.m(e,null)):$&&(m(),v($,1,1,(()=>{$=null})),f())},i(t){u||(g($),u=!0)},o(t){v($),u=!1},d(t){t&&n(e),d&&d.d(),$&&$.d()}}}function R(t,e,s){let{data:i}=e,l=Math.min(i.items.length,5);return t.$$set=t=>{"data"in t&&s(0,i=t.data)},[i,l,t=>{s(1,l=t.detail)}]}class B extends t{constructor(t){super(),e(this,t,R,H,s,{data:0})}}export{B as T};
