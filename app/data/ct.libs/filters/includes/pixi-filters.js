/*!
 * pixi-filters - v5.3.0
 * Compiled Thu, 15 Feb 2024 16:39:05 UTC
 *
 * pixi-filters is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */var __filters=function(f,a,Pe,I){"use strict";var Me=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,De=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float gamma;
uniform float contrast;
uniform float saturation;
uniform float brightness;
uniform float red;
uniform float green;
uniform float blue;
uniform float alpha;

void main(void)
{
    vec4 c = texture2D(uSampler, vTextureCoord);

    if (c.a > 0.0) {
        c.rgb /= c.a;

        vec3 rgb = pow(c.rgb, vec3(1. / gamma));
        rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);
        rgb.r *= red;
        rgb.g *= green;
        rgb.b *= blue;
        c.rgb = rgb * brightness;

        c.rgb *= c.a;
    }

    gl_FragColor = c * alpha;
}
`;class ke extends a.Filter{constructor(e){super(Me,De),this.gamma=1,this.saturation=1,this.contrast=1,this.brightness=1,this.red=1,this.green=1,this.blue=1,this.alpha=1,Object.assign(this,e)}apply(e,r,i,o){this.uniforms.gamma=Math.max(this.gamma,1e-4),this.uniforms.saturation=this.saturation,this.uniforms.contrast=this.contrast,this.uniforms.brightness=this.brightness,this.uniforms.red=this.red,this.uniforms.green=this.green,this.uniforms.blue=this.blue,this.uniforms.alpha=this.alpha,e.applyFilter(this,r,i,o)}}var Oe=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Re=`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 uOffset;

void main(void)
{
    vec4 color = vec4(0.0);

    // Sample top left pixel
    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y));

    // Sample top right pixel
    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y));

    // Sample bottom right pixel
    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y));

    // Sample bottom left pixel
    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y));

    // Average
    color *= 0.25;

    gl_FragColor = color;
}`,$e=`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 uOffset;
uniform vec4 filterClamp;

void main(void)
{
    vec4 color = vec4(0.0);

    // Sample top left pixel
    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));

    // Sample top right pixel
    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));

    // Sample bottom right pixel
    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));

    // Sample bottom left pixel
    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));

    // Average
    color *= 0.25;

    gl_FragColor = color;
}
`;class T extends a.Filter{constructor(e=4,r=3,i=!1){super(Oe,i?$e:Re),this._kernels=[],this._blur=4,this._quality=3,this.uniforms.uOffset=new Float32Array(2),this._pixelSize=new a.Point,this.pixelSize=1,this._clamp=i,Array.isArray(e)?this.kernels=e:(this._blur=e,this.quality=r)}apply(e,r,i,o){const s=this._pixelSize.x/r._frame.width,n=this._pixelSize.y/r._frame.height;let l;if(this._quality===1||this._blur===0)l=this._kernels[0]+.5,this.uniforms.uOffset[0]=l*s,this.uniforms.uOffset[1]=l*n,e.applyFilter(this,r,i,o);else{const u=e.getFilterTexture();let h=r,p=u,S;const g=this._quality-1;for(let x=0;x<g;x++)l=this._kernels[x]+.5,this.uniforms.uOffset[0]=l*s,this.uniforms.uOffset[1]=l*n,e.applyFilter(this,h,p,1),S=h,h=p,p=S;l=this._kernels[g]+.5,this.uniforms.uOffset[0]=l*s,this.uniforms.uOffset[1]=l*n,e.applyFilter(this,h,i,o),e.returnFilterTexture(u)}}_updatePadding(){this.padding=Math.ceil(this._kernels.reduce((e,r)=>e+r+.5,0))}_generateKernels(){const e=this._blur,r=this._quality,i=[e];if(e>0){let o=e;const s=e/r;for(let n=1;n<r;n++)o-=s,i.push(o)}this._kernels=i,this._updatePadding()}get kernels(){return this._kernels}set kernels(e){Array.isArray(e)&&e.length>0?(this._kernels=e,this._quality=e.length,this._blur=Math.max(...e)):(this._kernels=[0],this._quality=1)}get clamp(){return this._clamp}set pixelSize(e){typeof e=="number"?(this._pixelSize.x=e,this._pixelSize.y=e):Array.isArray(e)?(this._pixelSize.x=e[0],this._pixelSize.y=e[1]):e instanceof a.Point?(this._pixelSize.x=e.x,this._pixelSize.y=e.y):(this._pixelSize.x=1,this._pixelSize.y=1)}get pixelSize(){return this._pixelSize}get quality(){return this._quality}set quality(e){this._quality=Math.max(1,Math.round(e)),this._generateKernels()}get blur(){return this._blur}set blur(e){this._blur=e,this._generateKernels()}}var L=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Ee=`
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform float threshold;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);

    // A simple & fast algorithm for getting brightness.
    // It's inaccuracy , but good enought for this feature.
    float _max = max(max(color.r, color.g), color.b);
    float _min = min(min(color.r, color.g), color.b);
    float brightness = (_max + _min) * 0.5;

    if(brightness > threshold) {
        gl_FragColor = color;
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
`;class je extends a.Filter{constructor(e=.5){super(L,Ee),this.threshold=e}get threshold(){return this.uniforms.threshold}set threshold(e){this.uniforms.threshold=e}}var Ie=`uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform sampler2D bloomTexture;
uniform float bloomScale;
uniform float brightness;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    color.rgb *= brightness;
    vec4 bloomColor = vec4(texture2D(bloomTexture, vTextureCoord).rgb, 0.0);
    bloomColor.rgb *= bloomScale;
    gl_FragColor = color + bloomColor;
}
`;const V=class extends a.Filter{constructor(t){super(L,Ie),this.bloomScale=1,this.brightness=1,this._resolution=a.settings.FILTER_RESOLUTION,typeof t=="number"&&(t={threshold:t});const e=Object.assign(V.defaults,t);this.bloomScale=e.bloomScale,this.brightness=e.brightness;const{kernels:r,blur:i,quality:o,pixelSize:s,resolution:n}=e;this._extractFilter=new je(e.threshold),this._extractFilter.resolution=n,this._blurFilter=r?new T(r):new T(i,o),this.pixelSize=s,this.resolution=n}apply(t,e,r,i,o){const s=t.getFilterTexture();this._extractFilter.apply(t,e,s,1,o);const n=t.getFilterTexture();this._blurFilter.apply(t,s,n,1),this.uniforms.bloomScale=this.bloomScale,this.uniforms.brightness=this.brightness,this.uniforms.bloomTexture=n,t.applyFilter(this,e,r,i),t.returnFilterTexture(n),t.returnFilterTexture(s)}get resolution(){return this._resolution}set resolution(t){this._resolution=t,this._extractFilter&&(this._extractFilter.resolution=t),this._blurFilter&&(this._blurFilter.resolution=t)}get threshold(){return this._extractFilter.threshold}set threshold(t){this._extractFilter.threshold=t}get kernels(){return this._blurFilter.kernels}set kernels(t){this._blurFilter.kernels=t}get blur(){return this._blurFilter.blur}set blur(t){this._blurFilter.blur=t}get quality(){return this._blurFilter.quality}set quality(t){this._blurFilter.quality=t}get pixelSize(){return this._blurFilter.pixelSize}set pixelSize(t){this._blurFilter.pixelSize=t}};let N=V;N.defaults={threshold:.5,bloomScale:1,brightness:1,kernels:null,blur:8,quality:4,pixelSize:1,resolution:a.settings.FILTER_RESOLUTION};var Le=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Ve=`varying vec2 vTextureCoord;

uniform vec4 filterArea;
uniform float pixelSize;
uniform sampler2D uSampler;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

vec2 pixelate(vec2 coord, vec2 size)
{
    return floor(coord / size) * size;
}

vec2 getMod(vec2 coord, vec2 size)
{
    return mod(coord, size) / size;
}

float character(float n, vec2 p)
{
    p = floor(p*vec2(4.0, 4.0) + 2.5);

    if (clamp(p.x, 0.0, 4.0) == p.x)
    {
        if (clamp(p.y, 0.0, 4.0) == p.y)
        {
            if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;
        }
    }
    return 0.0;
}

void main()
{
    vec2 coord = mapCoord(vTextureCoord);

    // get the grid position
    vec2 pixCoord = pixelate(coord, vec2(pixelSize));
    pixCoord = unmapCoord(pixCoord);

    // sample the color at grid position
    vec4 color = texture2D(uSampler, pixCoord);

    // brightness of the color as it's perceived by the human eye
    float gray = 0.3 * color.r + 0.59 * color.g + 0.11 * color.b;

    // determine the character to use
    float n =  65536.0;             // .
    if (gray > 0.2) n = 65600.0;    // :
    if (gray > 0.3) n = 332772.0;   // *
    if (gray > 0.4) n = 15255086.0; // o
    if (gray > 0.5) n = 23385164.0; // &
    if (gray > 0.6) n = 15252014.0; // 8
    if (gray > 0.7) n = 13199452.0; // @
    if (gray > 0.8) n = 11512810.0; // #

    // get the mod..
    vec2 modd = getMod(coord, vec2(pixelSize));

    gl_FragColor = color * character( n, vec2(-1.0) + modd * 2.0);

}
`;class Ne extends a.Filter{constructor(e=8){super(Le,Ve),this.size=e}get size(){return this.uniforms.pixelSize}set size(e){this.uniforms.pixelSize=e}}var Ge=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Be=`precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform float transformX;
uniform float transformY;
uniform vec3 lightColor;
uniform float lightAlpha;
uniform vec3 shadowColor;
uniform float shadowAlpha;

void main(void) {
    vec2 transform = vec2(1.0 / filterArea) * vec2(transformX, transformY);
    vec4 color = texture2D(uSampler, vTextureCoord);
    float light = texture2D(uSampler, vTextureCoord - transform).a;
    float shadow = texture2D(uSampler, vTextureCoord + transform).a;

    color.rgb = mix(color.rgb, lightColor, clamp((color.a - light) * lightAlpha, 0.0, 1.0));
    color.rgb = mix(color.rgb, shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));
    gl_FragColor = vec4(color.rgb * color.a, color.a);
}
`;class Xe extends a.Filter{constructor(e){super(Ge,Be),this._thickness=2,this._angle=0,this.uniforms.lightColor=new Float32Array(3),this.uniforms.shadowColor=new Float32Array(3),Object.assign(this,{rotation:45,thickness:2,lightColor:16777215,lightAlpha:.7,shadowColor:0,shadowAlpha:.7},e),this.padding=1}_updateTransform(){this.uniforms.transformX=this._thickness*Math.cos(this._angle),this.uniforms.transformY=this._thickness*Math.sin(this._angle)}get rotation(){return this._angle/a.DEG_TO_RAD}set rotation(e){this._angle=e*a.DEG_TO_RAD,this._updateTransform()}get thickness(){return this._thickness}set thickness(e){this._thickness=e,this._updateTransform()}get lightColor(){return a.utils.rgb2hex(this.uniforms.lightColor)}set lightColor(e){a.utils.hex2rgb(e,this.uniforms.lightColor)}get lightAlpha(){return this.uniforms.lightAlpha}set lightAlpha(e){this.uniforms.lightAlpha=e}get shadowColor(){return a.utils.rgb2hex(this.uniforms.shadowColor)}set shadowColor(e){a.utils.hex2rgb(e,this.uniforms.shadowColor)}get shadowAlpha(){return this.uniforms.shadowAlpha}set shadowAlpha(e){this.uniforms.shadowAlpha=e}}class qe extends a.Filter{constructor(e=2,r=4,i=a.settings.FILTER_RESOLUTION,o=5){super();let s,n;typeof e=="number"?(s=e,n=e):e instanceof a.Point?(s=e.x,n=e.y):Array.isArray(e)&&(s=e[0],n=e[1]),this.blurXFilter=new I.BlurFilterPass(!0,s,r,i,o),this.blurYFilter=new I.BlurFilterPass(!1,n,r,i,o),this.blurYFilter.blendMode=a.BLEND_MODES.SCREEN,this.defaultFilter=new Pe.AlphaFilter}apply(e,r,i,o){const s=e.getFilterTexture();this.defaultFilter.apply(e,r,i,o),this.blurXFilter.apply(e,r,s,1),this.blurYFilter.apply(e,s,i,0),e.returnFilterTexture(s)}get blur(){return this.blurXFilter.blur}set blur(e){this.blurXFilter.blur=this.blurYFilter.blur=e}get blurX(){return this.blurXFilter.blur}set blurX(e){this.blurXFilter.blur=e}get blurY(){return this.blurYFilter.blur}set blurY(e){this.blurYFilter.blur=e}}var Ke=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,We=`uniform float radius;
uniform float strength;
uniform vec2 center;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;

void main()
{
    vec2 coord = vTextureCoord * filterArea.xy;
    coord -= center * dimensions.xy;
    float distance = length(coord);
    if (distance < radius) {
        float percent = distance / radius;
        if (strength > 0.0) {
            coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);
        } else {
            coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);
        }
    }
    coord += center * dimensions.xy;
    coord /= filterArea.xy;
    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);
    vec4 color = texture2D(uSampler, clampedCoord);
    if (coord != clampedCoord) {
        color *= max(0.0, 1.0 - length(coord - clampedCoord));
    }

    gl_FragColor = color;
}
`;const G=class extends a.Filter{constructor(t){super(Ke,We),this.uniforms.dimensions=new Float32Array(2),Object.assign(this,G.defaults,t)}apply(t,e,r,i){const{width:o,height:s}=e.filterFrame;this.uniforms.dimensions[0]=o,this.uniforms.dimensions[1]=s,t.applyFilter(this,e,r,i)}get radius(){return this.uniforms.radius}set radius(t){this.uniforms.radius=t}get strength(){return this.uniforms.strength}set strength(t){this.uniforms.strength=t}get center(){return this.uniforms.center}set center(t){this.uniforms.center=t}};let B=G;B.defaults={center:[.5,.5],radius:100,strength:1};var Ye=`const float PI = 3.1415926538;
const float PI_2 = PI*2.;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;
uniform sampler2D uSampler;

const int TYPE_LINEAR = 0;
const int TYPE_RADIAL = 1;
const int TYPE_CONIC = 2;
const int MAX_STOPS = 32;

uniform int uNumStops;
uniform float uAlphas[3*MAX_STOPS];
uniform vec3 uColors[MAX_STOPS];
uniform float uOffsets[MAX_STOPS];
uniform int uType;
uniform float uAngle;
uniform float uAlpha;
uniform int uMaxColors;
uniform bool uReplace;

struct ColorStop {
    float offset;
    vec3 color;
    float alpha;
};

mat2 rotate2d(float angle){
    return mat2(cos(angle), -sin(angle),
    sin(angle), cos(angle));
}

float projectLinearPosition(vec2 pos, float angle){
    vec2 center = vec2(0.5);
    vec2 result = pos - center;
    result = rotate2d(angle) * result;
    result = result + center;
    return clamp(result.x, 0., 1.);
}

float projectRadialPosition(vec2 pos) {
    float r = distance(vFilterCoord, vec2(0.5));
    return clamp(2.*r, 0., 1.);
}

float projectAnglePosition(vec2 pos, float angle) {
    vec2 center = pos - vec2(0.5);
    float polarAngle=atan(-center.y, center.x);
    return mod(polarAngle + angle, PI_2) / PI_2;
}

float projectPosition(vec2 pos, int type, float angle) {
    if (type == TYPE_LINEAR) {
        return projectLinearPosition(pos, angle);
    } else if (type == TYPE_RADIAL) {
        return projectRadialPosition(pos);
    } else if (type == TYPE_CONIC) {
        return projectAnglePosition(pos, angle);
    }

    return pos.y;
}

void main(void) {
    // current/original color
    vec4 currentColor = texture2D(uSampler, vTextureCoord);

    // skip calculations if gradient alpha is 0
    if (0.0 == uAlpha) {
        gl_FragColor = currentColor;
        return;
    }

    // project position
    float y = projectPosition(vFilterCoord, uType, radians(uAngle));

    // check gradient bounds
    float offsetMin = uOffsets[0];
    float offsetMax = 0.0;

    for (int i = 0; i < MAX_STOPS; i++) {
        if (i == uNumStops-1){ // last index
            offsetMax = uOffsets[i];
        }
    }

    if (y  < offsetMin || y > offsetMax) {
        gl_FragColor = currentColor;
        return;
    }

    // limit colors
    if (uMaxColors > 0) {
        float stepSize = 1./float(uMaxColors);
        float stepNumber = float(floor(y/stepSize));
        y = stepSize * (stepNumber + 0.5);// offset by 0.5 to use color from middle of segment
    }

    // find color stops
    ColorStop from;
    ColorStop to;

    for (int i = 0; i < MAX_STOPS; i++) {
        if (y >= uOffsets[i]) {
            from = ColorStop(uOffsets[i], uColors[i], uAlphas[i]);
            to = ColorStop(uOffsets[i+1], uColors[i+1], uAlphas[i+1]);
        }

        if (i == uNumStops-1){ // last index
            break;
        }
    }

    // mix colors from stops
    vec4 colorFrom = vec4(from.color * from.alpha, from.alpha);
    vec4 colorTo = vec4(to.color * to.alpha, to.alpha);

    float segmentHeight = to.offset - from.offset;
    float relativePos = y - from.offset;// position from 0 to [segmentHeight]
    float relativePercent = relativePos / segmentHeight;// position in percent between [from.offset] and [to.offset].

    float gradientAlpha = uAlpha * currentColor.a;
    vec4 gradientColor = mix(colorFrom, colorTo, relativePercent) * gradientAlpha;

    if (uReplace == false) {
        // mix resulting color with current color
        gl_FragColor = gradientColor + currentColor*(1.-gradientColor.a);
    } else {
        // replace with gradient color
        gl_FragColor = gradientColor;
    }
}
`,Ue=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform vec4 inputSize;
uniform vec4 outputFrame;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
    vFilterCoord = vTextureCoord * inputSize.xy / outputFrame.zw;
}
`,_=_||{};_.stringify=function(){var t={"visit_linear-gradient":function(e){return t.visit_gradient(e)},"visit_repeating-linear-gradient":function(e){return t.visit_gradient(e)},"visit_radial-gradient":function(e){return t.visit_gradient(e)},"visit_repeating-radial-gradient":function(e){return t.visit_gradient(e)},visit_gradient:function(e){var r=t.visit(e.orientation);return r&&(r+=", "),e.type+"("+r+t.visit(e.colorStops)+")"},visit_shape:function(e){var r=e.value,i=t.visit(e.at),o=t.visit(e.style);return o&&(r+=" "+o),i&&(r+=" at "+i),r},"visit_default-radial":function(e){var r="",i=t.visit(e.at);return i&&(r+=i),r},"visit_extent-keyword":function(e){var r=e.value,i=t.visit(e.at);return i&&(r+=" at "+i),r},"visit_position-keyword":function(e){return e.value},visit_position:function(e){return t.visit(e.value.x)+" "+t.visit(e.value.y)},"visit_%":function(e){return e.value+"%"},visit_em:function(e){return e.value+"em"},visit_px:function(e){return e.value+"px"},visit_literal:function(e){return t.visit_color(e.value,e)},visit_hex:function(e){return t.visit_color("#"+e.value,e)},visit_rgb:function(e){return t.visit_color("rgb("+e.value.join(", ")+")",e)},visit_rgba:function(e){return t.visit_color("rgba("+e.value.join(", ")+")",e)},visit_color:function(e,r){var i=e,o=t.visit(r.length);return o&&(i+=" "+o),i},visit_angular:function(e){return e.value+"deg"},visit_directional:function(e){return"to "+e.value},visit_array:function(e){var r="",i=e.length;return e.forEach(function(o,s){r+=t.visit(o),s<i-1&&(r+=", ")}),r},visit:function(e){if(!e)return"";var r="";if(e instanceof Array)return t.visit_array(e,r);if(e.type){var i=t["visit_"+e.type];if(i)return i(e);throw Error("Missing visitor visit_"+e.type)}else throw Error("Invalid node.")}};return function(e){return t.visit(e)}}();var _=_||{};_.parse=function(){var t={linearGradient:/^(\-(webkit|o|ms|moz)\-)?(linear\-gradient)/i,repeatingLinearGradient:/^(\-(webkit|o|ms|moz)\-)?(repeating\-linear\-gradient)/i,radialGradient:/^(\-(webkit|o|ms|moz)\-)?(radial\-gradient)/i,repeatingRadialGradient:/^(\-(webkit|o|ms|moz)\-)?(repeating\-radial\-gradient)/i,sideOrCorner:/^to (left (top|bottom)|right (top|bottom)|left|right|top|bottom)/i,extentKeywords:/^(closest\-side|closest\-corner|farthest\-side|farthest\-corner|contain|cover)/,positionKeywords:/^(left|center|right|top|bottom)/i,pixelValue:/^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))px/,percentageValue:/^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))\%/,emValue:/^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))em/,angleValue:/^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))deg/,startCall:/^\(/,endCall:/^\)/,comma:/^,/,hexColor:/^\#([0-9a-fA-F]+)/,literalColor:/^([a-zA-Z]+)/,rgbColor:/^rgb/i,rgbaColor:/^rgba/i,number:/^(([0-9]*\.[0-9]+)|([0-9]+\.?))/},e="";function r(c){var d=new Error(e+": "+c);throw d.source=e,d}function i(){var c=o();return e.length>0&&r("Invalid input not EOF"),c}function o(){return w(s)}function s(){return n("linear-gradient",t.linearGradient,u)||n("repeating-linear-gradient",t.repeatingLinearGradient,u)||n("radial-gradient",t.radialGradient,S)||n("repeating-radial-gradient",t.repeatingRadialGradient,S)}function n(c,d,m){return l(d,function(C){var we=m();return we&&(y(t.comma)||r("Missing comma before color stops")),{type:c,orientation:we,colorStops:w(Vr)}})}function l(c,d){var m=y(c);if(m){y(t.startCall)||r("Missing (");var C=d(m);return y(t.endCall)||r("Missing )"),C}}function u(){return h()||p()}function h(){return v("directional",t.sideOrCorner,1)}function p(){return v("angular",t.angleValue,1)}function S(){var c,d=g(),m;return d&&(c=[],c.push(d),m=e,y(t.comma)&&(d=g(),d?c.push(d):e=m)),c}function g(){var c=x()||Ir();if(c)c.at=Se();else{var d=j();if(d){c=d;var m=Se();m&&(c.at=m)}else{var C=Te();C&&(c={type:"default-radial",at:C})}}return c}function x(){var c=v("shape",/^(circle)/i,0);return c&&(c.style=Ae()||j()),c}function Ir(){var c=v("shape",/^(ellipse)/i,0);return c&&(c.style=P()||j()),c}function j(){return v("extent-keyword",t.extentKeywords,1)}function Se(){if(v("position",/^at/,0)){var c=Te();return c||r("Missing positioning value"),c}}function Te(){var c=Lr();if(c.x||c.y)return{type:"position",value:c}}function Lr(){return{x:P(),y:P()}}function w(c){var d=c(),m=[];if(d)for(m.push(d);y(t.comma);)d=c(),d?m.push(d):r("One extra comma");return m}function Vr(){var c=Nr();return c||r("Expected color definition"),c.length=P(),c}function Nr(){return Br()||qr()||Xr()||Gr()}function Gr(){return v("literal",t.literalColor,0)}function Br(){return v("hex",t.hexColor,1)}function Xr(){return l(t.rgbColor,function(){return{type:"rgb",value:w(Fe)}})}function qr(){return l(t.rgbaColor,function(){return{type:"rgba",value:w(Fe)}})}function Fe(){return y(t.number)[1]}function P(){return v("%",t.percentageValue,1)||Kr()||Ae()}function Kr(){return v("position-keyword",t.positionKeywords,1)}function Ae(){return v("px",t.pixelValue,1)||v("em",t.emValue,1)}function v(c,d,m){var C=y(d);if(C)return{type:c,value:C[m]}}function y(c){var d,m;return m=/^[\n\r\t\s]+/.exec(e),m&&ze(m[0].length),d=c.exec(e),d&&ze(d[0].length),d}function ze(c){e=e.substr(c)}return function(c){return e=c.toString(),i()}}();var Ze=_.parse;_.stringify;var X={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]},q={red:0,orange:60,yellow:120,green:180,blue:240,purple:300};function He(t){var e,r=[],i=1,o;if(typeof t=="string")if(X[t])r=X[t].slice(),o="rgb";else if(t==="transparent")i=0,o="rgb",r=[0,0,0];else if(/^#[A-Fa-f0-9]+$/.test(t)){var s=t.slice(1),n=s.length,l=n<=4;i=1,l?(r=[parseInt(s[0]+s[0],16),parseInt(s[1]+s[1],16),parseInt(s[2]+s[2],16)],n===4&&(i=parseInt(s[3]+s[3],16)/255)):(r=[parseInt(s[0]+s[1],16),parseInt(s[2]+s[3],16),parseInt(s[4]+s[5],16)],n===8&&(i=parseInt(s[6]+s[7],16)/255)),r[0]||(r[0]=0),r[1]||(r[1]=0),r[2]||(r[2]=0),o="rgb"}else if(e=/^((?:rgb|hs[lvb]|hwb|cmyk?|xy[zy]|gray|lab|lchu?v?|[ly]uv|lms)a?)\s*\(([^\)]*)\)/.exec(t)){var u=e[1],h=u==="rgb",s=u.replace(/a$/,"");o=s;var n=s==="cmyk"?4:s==="gray"?1:3;r=e[2].trim().split(/\s*[,\/]\s*|\s+/).map(function(g,x){if(/%$/.test(g))return x===n?parseFloat(g)/100:s==="rgb"?parseFloat(g)*255/100:parseFloat(g);if(s[x]==="h"){if(/deg$/.test(g))return parseFloat(g);if(q[g]!==void 0)return q[g]}return parseFloat(g)}),u===s&&r.push(1),i=h||r[n]===void 0?1:r[n],r=r.slice(0,n)}else t.length>10&&/[0-9](?:\s|\/)/.test(t)&&(r=t.match(/([0-9]+)/g).map(function(p){return parseFloat(p)}),o=t.match(/([a-z])/ig).join("").toLowerCase());else isNaN(t)?Array.isArray(t)||t.length?(r=[t[0],t[1],t[2]],o="rgb",i=t.length===4?t[3]:1):t instanceof Object&&(t.r!=null||t.red!=null||t.R!=null?(o="rgb",r=[t.r||t.red||t.R||0,t.g||t.green||t.G||0,t.b||t.blue||t.B||0]):(o="hsl",r=[t.h||t.hue||t.H||0,t.s||t.saturation||t.S||0,t.l||t.lightness||t.L||t.b||t.brightness]),i=t.a||t.alpha||t.opacity||1,t.opacity!=null&&(i/=100)):(o="rgb",r=[t>>>16,(t&65280)>>>8,t&255]);return{space:o,values:r,alpha:i}}var M={name:"rgb",min:[0,0,0],max:[255,255,255],channel:["red","green","blue"],alias:["RGB"]},D={name:"hsl",min:[0,0,0],max:[360,100,100],channel:["hue","saturation","lightness"],alias:["HSL"],rgb:function(t){var e=t[0]/360,r=t[1]/100,i=t[2]/100,o,s,n,l,u;if(r===0)return u=i*255,[u,u,u];i<.5?s=i*(1+r):s=i+r-i*r,o=2*i-s,l=[0,0,0];for(var h=0;h<3;h++)n=e+1/3*-(h-1),n<0?n++:n>1&&n--,6*n<1?u=o+(s-o)*6*n:2*n<1?u=s:3*n<2?u=o+(s-o)*(2/3-n)*6:u=o,l[h]=u*255;return l}};M.hsl=function(t){var e=t[0]/255,r=t[1]/255,i=t[2]/255,o=Math.min(e,r,i),s=Math.max(e,r,i),n=s-o,l,u,h;return s===o?l=0:e===s?l=(r-i)/n:r===s?l=2+(i-e)/n:i===s&&(l=4+(e-r)/n),l=Math.min(l*60,360),l<0&&(l+=360),h=(o+s)/2,s===o?u=0:h<=.5?u=n/(s+o):u=n/(2-s-o),[l,u*100,h*100]};function Qe(t){Array.isArray(t)&&t.raw&&(t=String.raw(...arguments));var e,r=He(t);if(!r.space)return[];const i=r.space[0]==="h"?D.min:M.min,o=r.space[0]==="h"?D.max:M.max;return e=Array(3),e[0]=Math.min(Math.max(r.values[0],i[0]),o[0]),e[1]=Math.min(Math.max(r.values[1],i[1]),o[1]),e[2]=Math.min(Math.max(r.values[2],i[2]),o[2]),r.space[0]==="h"&&(e=D.rgb(e)),e.push(Math.min(Math.max(r.alpha,0),1)),e}function K(t){switch(typeof t){case"string":return Je(t);case"number":return a.utils.hex2rgb(t);default:return t}}function Je(t){const e=Qe(t);if(!e)throw new Error(`Unable to parse color "${t}" as RGBA.`);return[e[0]/255,e[1]/255,e[2]/255,e[3]]}function et(t){const e=Ze(ut(t));if(e.length===0)throw new Error("Invalid CSS gradient.");if(e.length!==1)throw new Error("Unsupported CSS gradient (multiple gradients is not supported).");const r=e[0],i=tt(r.type),o=rt(r.colorStops),s=nt(r.orientation);return{type:i,stops:o,angle:s}}function tt(t){const e={"linear-gradient":0,"radial-gradient":1};if(!(t in e))throw new Error(`Unsupported gradient type "${t}"`);return e[t]}function rt(t){const e=st(t),r=[];for(let i=0;i<t.length;i++){const o=it(t[i]);r.push({offset:e[i],color:o.slice(0,3),alpha:o[3]})}return r}function it(t){return K(ot(t))}function ot(t){switch(t.type){case"hex":return`#${t.value}`;case"literal":return t.value;default:return`${t.type}(${t.value.join(",")})`}}function st(t){const e=[];for(let o=0;o<t.length;o++){const s=t[o];let n=-1;s.type==="literal"&&s.length&&"type"in s.length&&s.length.type==="%"&&"value"in s.length&&(n=parseFloat(s.length.value)/100),e.push(n)}const r=o=>{for(let s=o;s<e.length;s++)if(e[s]!==-1)return{indexDelta:s-o,offset:e[s]};return{indexDelta:e.length-1-o,offset:1}};let i=0;for(let o=0;o<e.length;o++){const s=e[o];if(s!==-1)i=s;else if(o===0)e[o]=0;else if(o+1===e.length)e[o]=1;else{const n=r(o),l=(n.offset-i)/(1+n.indexDelta);for(let u=0;u<=n.indexDelta;u++)e[o+u]=i+(u+1)*l;o+=n.indexDelta,i=e[o]}}return e.map(at)}function at(t){return t.toString().length>6?parseFloat(t.toString().substring(0,6)):t}function nt(t){if(typeof t=="undefined")return 0;if("type"in t&&"value"in t)switch(t.type){case"angular":return parseFloat(t.value);case"directional":return lt(t.value)}return 0}function lt(t){const e={left:270,top:0,bottom:180,right:90,"left top":315,"top left":315,"left bottom":225,"bottom left":225,"right top":45,"top right":45,"right bottom":135,"bottom right":135};if(!(t in e))throw new Error(`Unsupported directional value "${t}"`);return e[t]}function ut(t){let e=t.replace(/\s{2,}/gu," ");return e=e.replace(/;/g,""),e=e.replace(/ ,/g,","),e=e.replace(/\( /g,"("),e=e.replace(/ \)/g,")"),e.trim()}var ct=Object.defineProperty,ft=Object.defineProperties,dt=Object.getOwnPropertyDescriptors,W=Object.getOwnPropertySymbols,ht=Object.prototype.hasOwnProperty,mt=Object.prototype.propertyIsEnumerable,Y=(t,e,r)=>e in t?ct(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r,k=(t,e)=>{for(var r in e||(e={}))ht.call(e,r)&&Y(t,r,e[r]);if(W)for(var r of W(e))mt.call(e,r)&&Y(t,r,e[r]);return t},gt=(t,e)=>ft(t,dt(e));const U=90;function vt(t){return[...t].sort((e,r)=>e.offset-r.offset)}const F=class extends a.Filter{constructor(t){var e,r;let i;if(t&&"css"in t?i=gt(k({},et(t.css||"")),{alpha:(e=t.alpha)!=null?e:F.defaults.alpha,maxColors:(r=t.maxColors)!=null?r:F.defaults.maxColors}):i=k(k({},F.defaults),t),!i.stops||i.stops.length<2)throw new Error("ColorGradientFilter requires at least 2 color stops.");super(Ue,Ye),this._stops=[],this.autoFit=!1,Object.assign(this,i)}get stops(){return this._stops}set stops(t){const e=vt(t),r=new Float32Array(e.length*3),i=0,o=1,s=2;for(let n=0;n<e.length;n++){const l=K(e[n].color),u=n*3;r[u+i]=l[i],r[u+o]=l[o],r[u+s]=l[s]}this.uniforms.uColors=r,this.uniforms.uOffsets=e.map(n=>n.offset),this.uniforms.uAlphas=e.map(n=>n.alpha),this.uniforms.uNumStops=e.length,this._stops=e}set type(t){this.uniforms.uType=t}get type(){return this.uniforms.uType}set angle(t){this.uniforms.uAngle=t-U}get angle(){return this.uniforms.uAngle+U}set alpha(t){this.uniforms.uAlpha=t}get alpha(){return this.uniforms.uAlpha}set maxColors(t){this.uniforms.uMaxColors=t}get maxColors(){return this.uniforms.uMaxColors}set replace(t){this.uniforms.uReplace=t}get replace(){return this.uniforms.uReplace}};let A=F;A.LINEAR=0,A.RADIAL=1,A.CONIC=2,A.defaults={type:F.LINEAR,stops:[{offset:0,color:16711680,alpha:1},{offset:1,color:255,alpha:1}],alpha:1,angle:90,maxColors:0,replace:!1};var pt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,xt=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D colorMap;
uniform float _mix;
uniform float _size;
uniform float _sliceSize;
uniform float _slicePixelSize;
uniform float _sliceInnerSize;
void main() {
    vec4 color = texture2D(uSampler, vTextureCoord.xy);

    vec4 adjusted;
    if (color.a > 0.0) {
        color.rgb /= color.a;
        float innerWidth = _size - 1.0;
        float zSlice0 = min(floor(color.b * innerWidth), innerWidth);
        float zSlice1 = min(zSlice0 + 1.0, innerWidth);
        float xOffset = _slicePixelSize * 0.5 + color.r * _sliceInnerSize;
        float s0 = xOffset + (zSlice0 * _sliceSize);
        float s1 = xOffset + (zSlice1 * _sliceSize);
        float yOffset = _sliceSize * 0.5 + color.g * (1.0 - _sliceSize);
        vec4 slice0Color = texture2D(colorMap, vec2(s0,yOffset));
        vec4 slice1Color = texture2D(colorMap, vec2(s1,yOffset));
        float zOffset = fract(color.b * innerWidth);
        adjusted = mix(slice0Color, slice1Color, zOffset);

        color.rgb *= color.a;
    }
    gl_FragColor = vec4(mix(color, adjusted, _mix).rgb, color.a);

}`;class yt extends a.Filter{constructor(e,r=!1,i=1){super(pt,xt),this.mix=1,this._size=0,this._sliceSize=0,this._slicePixelSize=0,this._sliceInnerSize=0,this._nearest=!1,this._scaleMode=null,this._colorMap=null,this._scaleMode=null,this.nearest=r,this.mix=i,this.colorMap=e}apply(e,r,i,o){this.uniforms._mix=this.mix,e.applyFilter(this,r,i,o)}get colorSize(){return this._size}get colorMap(){return this._colorMap}set colorMap(e){!e||(e instanceof a.Texture||(e=a.Texture.from(e)),e!=null&&e.baseTexture&&(e.baseTexture.scaleMode=this._scaleMode,e.baseTexture.mipmap=a.MIPMAP_MODES.OFF,this._size=e.height,this._sliceSize=1/this._size,this._slicePixelSize=this._sliceSize/this._size,this._sliceInnerSize=this._slicePixelSize*(this._size-1),this.uniforms._size=this._size,this.uniforms._sliceSize=this._sliceSize,this.uniforms._slicePixelSize=this._slicePixelSize,this.uniforms._sliceInnerSize=this._sliceInnerSize,this.uniforms.colorMap=e),this._colorMap=e)}get nearest(){return this._nearest}set nearest(e){this._nearest=e,this._scaleMode=e?a.SCALE_MODES.NEAREST:a.SCALE_MODES.LINEAR;const r=this._colorMap;r&&r.baseTexture&&(r.baseTexture._glTextures={},r.baseTexture.scaleMode=this._scaleMode,r.baseTexture.mipmap=a.MIPMAP_MODES.OFF,r._updateID++,r.baseTexture.emit("update",r.baseTexture))}updateColorMap(){const e=this._colorMap;e&&e.baseTexture&&(e._updateID++,e.baseTexture.emit("update",e.baseTexture),this.colorMap=e)}destroy(e=!1){this._colorMap&&this._colorMap.destroy(e),super.destroy()}}var Ct=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,_t=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec3 color;
uniform float alpha;

void main(void) {
    vec4 currentColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(mix(currentColor.rgb, color.rgb, currentColor.a * alpha), currentColor.a);
}
`;class bt extends a.Filter{constructor(e=0,r=1){super(Ct,_t),this._color=0,this._alpha=1,this.uniforms.color=new Float32Array(3),this.color=e,this.alpha=r}set color(e){const r=this.uniforms.color;typeof e=="number"?(a.utils.hex2rgb(e,r),this._color=e):(r[0]=e[0],r[1]=e[1],r[2]=e[2],this._color=a.utils.rgb2hex(r))}get color(){return this._color}set alpha(e){this.uniforms.alpha=e,this._alpha=e}get alpha(){return this._alpha}}var St=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Tt=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec3 originalColor;
uniform vec3 newColor;
uniform float epsilon;
void main(void) {
    vec4 currentColor = texture2D(uSampler, vTextureCoord);
    vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));
    float colorDistance = length(colorDiff);
    float doReplace = step(colorDistance, epsilon);
    gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);
}
`;class Ft extends a.Filter{constructor(e=16711680,r=0,i=.4){super(St,Tt),this._originalColor=16711680,this._newColor=0,this.uniforms.originalColor=new Float32Array(3),this.uniforms.newColor=new Float32Array(3),this.originalColor=e,this.newColor=r,this.epsilon=i}set originalColor(e){const r=this.uniforms.originalColor;typeof e=="number"?(a.utils.hex2rgb(e,r),this._originalColor=e):(r[0]=e[0],r[1]=e[1],r[2]=e[2],this._originalColor=a.utils.rgb2hex(r))}get originalColor(){return this._originalColor}set newColor(e){const r=this.uniforms.newColor;typeof e=="number"?(a.utils.hex2rgb(e,r),this._newColor=e):(r[0]=e[0],r[1]=e[1],r[2]=e[2],this._newColor=a.utils.rgb2hex(r))}get newColor(){return this._newColor}set epsilon(e){this.uniforms.epsilon=e}get epsilon(){return this.uniforms.epsilon}}var At=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,zt=`precision mediump float;

varying mediump vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec2 texelSize;
uniform float matrix[9];

void main(void)
{
   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left
   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center
   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right

   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left
   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center
   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right

   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left
   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center
   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right

   gl_FragColor =
       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +
       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +
       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];

   gl_FragColor.a = c22.a;
}
`;class wt extends a.Filter{constructor(e,r=200,i=200){super(At,zt),this.uniforms.texelSize=new Float32Array(2),this.uniforms.matrix=new Float32Array(9),e!==void 0&&(this.matrix=e),this.width=r,this.height=i}get matrix(){return this.uniforms.matrix}set matrix(e){e.forEach((r,i)=>{this.uniforms.matrix[i]=r})}get width(){return 1/this.uniforms.texelSize[0]}set width(e){this.uniforms.texelSize[0]=1/e}get height(){return 1/this.uniforms.texelSize[1]}set height(e){this.uniforms.texelSize[1]=1/e}}var Pt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Mt=`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void)
{
    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);

    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

    if (lum < 1.00)
    {
        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }

    if (lum < 0.75)
    {
        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }

    if (lum < 0.50)
    {
        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }

    if (lum < 0.3)
    {
        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }
}
`;class Dt extends a.Filter{constructor(){super(Pt,Mt)}}var kt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Ot=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec2 dimensions;

const float SQRT_2 = 1.414213;

const float light = 1.0;

uniform float curvature;
uniform float lineWidth;
uniform float lineContrast;
uniform bool verticalLine;
uniform float noise;
uniform float noiseSize;

uniform float vignetting;
uniform float vignettingAlpha;
uniform float vignettingBlur;

uniform float seed;
uniform float time;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void)
{
    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;
    vec2 dir = vec2(vTextureCoord.xy * filterArea.xy / dimensions - vec2(0.5, 0.5));

    gl_FragColor = texture2D(uSampler, vTextureCoord);
    vec3 rgb = gl_FragColor.rgb;

    if (noise > 0.0 && noiseSize > 0.0)
    {
        pixelCoord.x = floor(pixelCoord.x / noiseSize);
        pixelCoord.y = floor(pixelCoord.y / noiseSize);
        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;
        rgb += _noise * noise;
    }

    if (lineWidth > 0.0)
    {
        float _c = curvature > 0. ? curvature : 1.;
        float k = curvature > 0. ?(length(dir * dir) * 0.25 * _c * _c + 0.935 * _c) : 1.;
        vec2 uv = dir * k;

        float v = (verticalLine ? uv.x * dimensions.x : uv.y * dimensions.y) * min(1.0, 2.0 / lineWidth ) / _c;
        float j = 1. + cos(v * 1.2 - time) * 0.5 * lineContrast;
        rgb *= j;
        float segment = verticalLine ? mod((dir.x + .5) * dimensions.x, 4.) : mod((dir.y + .5) * dimensions.y, 4.);
        rgb *= 0.99 + ceil(segment) * 0.015;
    }

    if (vignetting > 0.0)
    {
        float outter = SQRT_2 - vignetting * SQRT_2;
        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);
        rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);
    }

    gl_FragColor.rgb = rgb;
}
`;const Z=class extends a.Filter{constructor(t){super(kt,Ot),this.time=0,this.seed=0,this.uniforms.dimensions=new Float32Array(2),Object.assign(this,Z.defaults,t)}apply(t,e,r,i){const{width:o,height:s}=e.filterFrame;this.uniforms.dimensions[0]=o,this.uniforms.dimensions[1]=s,this.uniforms.seed=this.seed,this.uniforms.time=this.time,t.applyFilter(this,e,r,i)}set curvature(t){this.uniforms.curvature=t}get curvature(){return this.uniforms.curvature}set lineWidth(t){this.uniforms.lineWidth=t}get lineWidth(){return this.uniforms.lineWidth}set lineContrast(t){this.uniforms.lineContrast=t}get lineContrast(){return this.uniforms.lineContrast}set verticalLine(t){this.uniforms.verticalLine=t}get verticalLine(){return this.uniforms.verticalLine}set noise(t){this.uniforms.noise=t}get noise(){return this.uniforms.noise}set noiseSize(t){this.uniforms.noiseSize=t}get noiseSize(){return this.uniforms.noiseSize}set vignetting(t){this.uniforms.vignetting=t}get vignetting(){return this.uniforms.vignetting}set vignettingAlpha(t){this.uniforms.vignettingAlpha=t}get vignettingAlpha(){return this.uniforms.vignettingAlpha}set vignettingBlur(t){this.uniforms.vignettingBlur=t}get vignettingBlur(){return this.uniforms.vignettingBlur}};let H=Z;H.defaults={curvature:1,lineWidth:1,lineContrast:.25,verticalLine:!1,noise:0,noiseSize:1,seed:0,vignetting:.3,vignettingAlpha:1,vignettingBlur:.3,time:0};var Rt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,$t=`precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform vec4 filterArea;
uniform sampler2D uSampler;

uniform float angle;
uniform float scale;
uniform bool grayscale;

float pattern()
{
   float s = sin(angle), c = cos(angle);
   vec2 tex = vTextureCoord * filterArea.xy;
   vec2 point = vec2(
       c * tex.x - s * tex.y,
       s * tex.x + c * tex.y
   ) * scale;
   return (sin(point.x) * sin(point.y)) * 4.0;
}

void main()
{
   vec4 color = texture2D(uSampler, vTextureCoord);
   vec3 colorRGB = vec3(color);

   if (grayscale)
   {
       colorRGB = vec3(color.r + color.g + color.b) / 3.0;
   }

   gl_FragColor = vec4(colorRGB * 10.0 - 5.0 + pattern(), color.a);
}
`;class Et extends a.Filter{constructor(e=1,r=5,i=!0){super(Rt,$t),this.scale=e,this.angle=r,this.grayscale=i}get scale(){return this.uniforms.scale}set scale(e){this.uniforms.scale=e}get angle(){return this.uniforms.angle}set angle(e){this.uniforms.angle=e}get grayscale(){return this.uniforms.grayscale}set grayscale(e){this.uniforms.grayscale=e}}var jt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,It=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float alpha;
uniform vec3 color;

uniform vec2 shift;
uniform vec4 inputSize;

void main(void){
    vec4 sample = texture2D(uSampler, vTextureCoord - shift * inputSize.zw);

    // Premultiply alpha
    sample.rgb = color.rgb * sample.a;

    // alpha user alpha
    sample *= alpha;

    gl_FragColor = sample;
}`,Lt=Object.defineProperty,Q=Object.getOwnPropertySymbols,Vt=Object.prototype.hasOwnProperty,Nt=Object.prototype.propertyIsEnumerable,J=(t,e,r)=>e in t?Lt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r,ee=(t,e)=>{for(var r in e||(e={}))Vt.call(e,r)&&J(t,r,e[r]);if(Q)for(var r of Q(e))Nt.call(e,r)&&J(t,r,e[r]);return t};const O=class extends a.Filter{constructor(t){super(),this.angle=45,this._distance=5,this._resolution=a.settings.FILTER_RESOLUTION;const e=t?ee(ee({},O.defaults),t):O.defaults,{kernels:r,blur:i,quality:o,pixelSize:s,resolution:n}=e;this._offset=new a.ObservablePoint(this._updatePadding,this),this._tintFilter=new a.Filter(jt,It),this._tintFilter.uniforms.color=new Float32Array(4),this._tintFilter.uniforms.shift=this._offset,this._tintFilter.resolution=n,this._blurFilter=r?new T(r):new T(i,o),this.pixelSize=s,this.resolution=n;const{shadowOnly:l,rotation:u,distance:h,offset:p,alpha:S,color:g}=e;this.shadowOnly=l,u!==void 0&&h!==void 0?(this.rotation=u,this.distance=h):this.offset=p,this.alpha=S,this.color=g}apply(t,e,r,i){const o=t.getFilterTexture();this._tintFilter.apply(t,e,o,1),this._blurFilter.apply(t,o,r,i),this.shadowOnly!==!0&&t.applyFilter(this,e,r,0),t.returnFilterTexture(o)}_updatePadding(){const t=Math.max(Math.abs(this._offset.x),Math.abs(this._offset.y));this.padding=t+this.blur*2}_updateShift(){this._tintFilter.uniforms.shift.set(this.distance*Math.cos(this.angle),this.distance*Math.sin(this.angle))}set offset(t){this._offset.copyFrom(t),this._updatePadding()}get offset(){return this._offset}get resolution(){return this._resolution}set resolution(t){this._resolution=t,this._tintFilter&&(this._tintFilter.resolution=t),this._blurFilter&&(this._blurFilter.resolution=t)}get distance(){return this._distance}set distance(t){a.utils.deprecation("5.3.0","DropShadowFilter distance is deprecated, use offset"),this._distance=t,this._updatePadding(),this._updateShift()}get rotation(){return this.angle/a.DEG_TO_RAD}set rotation(t){a.utils.deprecation("5.3.0","DropShadowFilter rotation is deprecated, use offset"),this.angle=t*a.DEG_TO_RAD,this._updateShift()}get alpha(){return this._tintFilter.uniforms.alpha}set alpha(t){this._tintFilter.uniforms.alpha=t}get color(){return a.utils.rgb2hex(this._tintFilter.uniforms.color)}set color(t){a.utils.hex2rgb(t,this._tintFilter.uniforms.color)}get kernels(){return this._blurFilter.kernels}set kernels(t){this._blurFilter.kernels=t}get blur(){return this._blurFilter.blur}set blur(t){this._blurFilter.blur=t,this._updatePadding()}get quality(){return this._blurFilter.quality}set quality(t){this._blurFilter.quality=t}get pixelSize(){return this._blurFilter.pixelSize}set pixelSize(t){this._blurFilter.pixelSize=t}};let te=O;te.defaults={offset:{x:4,y:4},color:0,alpha:.5,shadowOnly:!1,kernels:null,blur:2,quality:3,pixelSize:1,resolution:a.settings.FILTER_RESOLUTION};var Gt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Bt=`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float strength;
uniform vec4 filterArea;


void main(void)
{
	vec2 onePixel = vec2(1.0 / filterArea);

	vec4 color;

	color.rgb = vec3(0.5);

	color -= texture2D(uSampler, vTextureCoord - onePixel) * strength;
	color += texture2D(uSampler, vTextureCoord + onePixel) * strength;

	color.rgb = vec3((color.r + color.g + color.b) / 3.0);

	float alpha = texture2D(uSampler, vTextureCoord).a;

	gl_FragColor = vec4(color.rgb * alpha, alpha);
}
`;class Xt extends a.Filter{constructor(e=5){super(Gt,Bt),this.strength=e}get strength(){return this.uniforms.strength}set strength(e){this.uniforms.strength=e}}var qt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Kt=`// precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;
uniform float aspect;

uniform sampler2D displacementMap;
uniform float offset;
uniform float sinDir;
uniform float cosDir;
uniform int fillMode;

uniform float seed;
uniform vec2 red;
uniform vec2 green;
uniform vec2 blue;

const int TRANSPARENT = 0;
const int ORIGINAL = 1;
const int LOOP = 2;
const int CLAMP = 3;
const int MIRROR = 4;

void main(void)
{
    vec2 coord = (vTextureCoord * filterArea.xy) / dimensions;

    if (coord.x > 1.0 || coord.y > 1.0) {
        return;
    }

    float cx = coord.x - 0.5;
    float cy = (coord.y - 0.5) * aspect;
    float ny = (-sinDir * cx + cosDir * cy) / aspect + 0.5;

    // displacementMap: repeat
    // ny = ny > 1.0 ? ny - 1.0 : (ny < 0.0 ? 1.0 + ny : ny);

    // displacementMap: mirror
    ny = ny > 1.0 ? 2.0 - ny : (ny < 0.0 ? -ny : ny);

    vec4 dc = texture2D(displacementMap, vec2(0.5, ny));

    float displacement = (dc.r - dc.g) * (offset / filterArea.x);

    coord = vTextureCoord + vec2(cosDir * displacement, sinDir * displacement * aspect);

    if (fillMode == CLAMP) {
        coord = clamp(coord, filterClamp.xy, filterClamp.zw);
    } else {
        if( coord.x > filterClamp.z ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.x -= filterClamp.z;
            } else if (fillMode == MIRROR) {
                coord.x = filterClamp.z * 2.0 - coord.x;
            }
        } else if( coord.x < filterClamp.x ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.x += filterClamp.z;
            } else if (fillMode == MIRROR) {
                coord.x *= -filterClamp.z;
            }
        }

        if( coord.y > filterClamp.w ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.y -= filterClamp.w;
            } else if (fillMode == MIRROR) {
                coord.y = filterClamp.w * 2.0 - coord.y;
            }
        } else if( coord.y < filterClamp.y ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.y += filterClamp.w;
            } else if (fillMode == MIRROR) {
                coord.y *= -filterClamp.w;
            }
        }
    }

    gl_FragColor.r = texture2D(uSampler, coord + red * (1.0 - seed * 0.4) / filterArea.xy).r;
    gl_FragColor.g = texture2D(uSampler, coord + green * (1.0 - seed * 0.3) / filterArea.xy).g;
    gl_FragColor.b = texture2D(uSampler, coord + blue * (1.0 - seed * 0.2) / filterArea.xy).b;
    gl_FragColor.a = texture2D(uSampler, coord).a;
}
`;const R=class extends a.Filter{constructor(t){super(qt,Kt),this.offset=100,this.fillMode=R.TRANSPARENT,this.average=!1,this.seed=0,this.minSize=8,this.sampleSize=512,this._slices=0,this._offsets=new Float32Array(1),this._sizes=new Float32Array(1),this._direction=-1,this.uniforms.dimensions=new Float32Array(2),this._canvas=document.createElement("canvas"),this._canvas.width=4,this._canvas.height=this.sampleSize,this.texture=a.Texture.from(this._canvas,{scaleMode:a.SCALE_MODES.NEAREST}),Object.assign(this,R.defaults,t)}apply(t,e,r,i){const{width:o,height:s}=e.filterFrame;this.uniforms.dimensions[0]=o,this.uniforms.dimensions[1]=s,this.uniforms.aspect=s/o,this.uniforms.seed=this.seed,this.uniforms.offset=this.offset,this.uniforms.fillMode=this.fillMode,t.applyFilter(this,e,r,i)}_randomizeSizes(){const t=this._sizes,e=this._slices-1,r=this.sampleSize,i=Math.min(this.minSize/r,.9/this._slices);if(this.average){const o=this._slices;let s=1;for(let n=0;n<e;n++){const l=s/(o-n),u=Math.max(l*(1-Math.random()*.6),i);t[n]=u,s-=u}t[e]=s}else{let o=1;const s=Math.sqrt(1/this._slices);for(let n=0;n<e;n++){const l=Math.max(s*o*Math.random(),i);t[n]=l,o-=l}t[e]=o}this.shuffle()}shuffle(){const t=this._sizes,e=this._slices-1;for(let r=e;r>0;r--){const i=Math.random()*r>>0,o=t[r];t[r]=t[i],t[i]=o}}_randomizeOffsets(){for(let t=0;t<this._slices;t++)this._offsets[t]=Math.random()*(Math.random()<.5?-1:1)}refresh(){this._randomizeSizes(),this._randomizeOffsets(),this.redraw()}redraw(){const t=this.sampleSize,e=this.texture,r=this._canvas.getContext("2d");r.clearRect(0,0,8,t);let i,o=0;for(let s=0;s<this._slices;s++){i=Math.floor(this._offsets[s]*256);const n=this._sizes[s]*t,l=i>0?i:0,u=i<0?-i:0;r.fillStyle=`rgba(${l}, ${u}, 0, 1)`,r.fillRect(0,o>>0,t,n+1>>0),o+=n}e.baseTexture.update(),this.uniforms.displacementMap=e}set sizes(t){const e=Math.min(this._slices,t.length);for(let r=0;r<e;r++)this._sizes[r]=t[r]}get sizes(){return this._sizes}set offsets(t){const e=Math.min(this._slices,t.length);for(let r=0;r<e;r++)this._offsets[r]=t[r]}get offsets(){return this._offsets}get slices(){return this._slices}set slices(t){this._slices!==t&&(this._slices=t,this.uniforms.slices=t,this._sizes=this.uniforms.slicesWidth=new Float32Array(t),this._offsets=this.uniforms.slicesOffset=new Float32Array(t),this.refresh())}get direction(){return this._direction}set direction(t){if(this._direction===t)return;this._direction=t;const e=t*a.DEG_TO_RAD;this.uniforms.sinDir=Math.sin(e),this.uniforms.cosDir=Math.cos(e)}get red(){return this.uniforms.red}set red(t){this.uniforms.red=t}get green(){return this.uniforms.green}set green(t){this.uniforms.green=t}get blue(){return this.uniforms.blue}set blue(t){this.uniforms.blue=t}destroy(){var t;(t=this.texture)==null||t.destroy(!0),this.texture=this._canvas=this.red=this.green=this.blue=this._sizes=this._offsets=null}};let b=R;b.defaults={slices:5,offset:100,direction:0,fillMode:0,average:!1,seed:0,red:[0,0],green:[0,0],blue:[0,0],minSize:8,sampleSize:512},b.TRANSPARENT=0,b.ORIGINAL=1,b.LOOP=2,b.CLAMP=3,b.MIRROR=4;var Wt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Yt=`varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;

uniform float outerStrength;
uniform float innerStrength;

uniform vec4 glowColor;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform bool knockout;
uniform float alpha;

const float PI = 3.14159265358979323846264;

const float DIST = __DIST__;
const float ANGLE_STEP_SIZE = min(__ANGLE_STEP_SIZE__, PI * 2.0);
const float ANGLE_STEP_NUM = ceil(PI * 2.0 / ANGLE_STEP_SIZE);

const float MAX_TOTAL_ALPHA = ANGLE_STEP_NUM * DIST * (DIST + 1.0) / 2.0;

void main(void) {
    vec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);

    float totalAlpha = 0.0;

    vec2 direction;
    vec2 displaced;
    vec4 curColor;

    for (float angle = 0.0; angle < PI * 2.0; angle += ANGLE_STEP_SIZE) {
       direction = vec2(cos(angle), sin(angle)) * px;

       for (float curDistance = 0.0; curDistance < DIST; curDistance++) {
           displaced = clamp(vTextureCoord + direction *
                   (curDistance + 1.0), filterClamp.xy, filterClamp.zw);

           curColor = texture2D(uSampler, displaced);

           totalAlpha += (DIST - curDistance) * curColor.a;
       }
    }

    curColor = texture2D(uSampler, vTextureCoord);

    float alphaRatio = (totalAlpha / MAX_TOTAL_ALPHA);

    float innerGlowAlpha = (1.0 - alphaRatio) * innerStrength * curColor.a;
    float innerGlowStrength = min(1.0, innerGlowAlpha);

    vec4 innerColor = mix(curColor, glowColor, innerGlowStrength);

    float outerGlowAlpha = alphaRatio * outerStrength * (1. - curColor.a);
    float outerGlowStrength = min(1.0 - innerColor.a, outerGlowAlpha);

    if (knockout) {
      float resultAlpha = (outerGlowAlpha + innerGlowAlpha) * alpha;
      gl_FragColor = vec4(glowColor.rgb * resultAlpha, resultAlpha);
    }
    else {
      vec4 outerGlowColor = outerGlowStrength * glowColor.rgba * alpha;
      gl_FragColor = innerColor + outerGlowColor;
    }
}
`;const re=class extends a.Filter{constructor(t){const e=Object.assign({},re.defaults,t),{outerStrength:r,innerStrength:i,color:o,knockout:s,quality:n,alpha:l}=e,u=Math.round(e.distance);super(Wt,Yt.replace(/__ANGLE_STEP_SIZE__/gi,`${(1/n/u).toFixed(7)}`).replace(/__DIST__/gi,`${u.toFixed(0)}.0`)),this.uniforms.glowColor=new Float32Array([0,0,0,1]),this.uniforms.alpha=1,Object.assign(this,{color:o,outerStrength:r,innerStrength:i,padding:u,knockout:s,alpha:l})}get color(){return a.utils.rgb2hex(this.uniforms.glowColor)}set color(t){a.utils.hex2rgb(t,this.uniforms.glowColor)}get outerStrength(){return this.uniforms.outerStrength}set outerStrength(t){this.uniforms.outerStrength=t}get innerStrength(){return this.uniforms.innerStrength}set innerStrength(t){this.uniforms.innerStrength=t}get knockout(){return this.uniforms.knockout}set knockout(t){this.uniforms.knockout=t}get alpha(){return this.uniforms.alpha}set alpha(t){this.uniforms.alpha=t}};let ie=re;ie.defaults={distance:10,outerStrength:4,innerStrength:0,color:16777215,quality:.1,knockout:!1,alpha:1};var Ut=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Zt=`vec3 mod289(vec3 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x)
{
    return mod289(((x * 34.0) + 1.0) * x);
}
vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t)
{
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}
float turb(vec3 P, vec3 rep, float lacunarity, float gain)
{
    float sum = 0.0;
    float sc = 1.0;
    float totalgain = 1.0;
    for (float i = 0.0; i < 6.0; i++)
    {
        sum += totalgain * pnoise(P * sc, rep);
        sc *= lacunarity;
        totalgain *= gain;
    }
    return abs(sum);
}
`,Ht=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec2 dimensions;

uniform vec2 light;
uniform bool parallel;
uniform float aspect;

uniform float gain;
uniform float lacunarity;
uniform float time;
uniform float alpha;

\${perlin}

void main(void) {
    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;

    float d;

    if (parallel) {
        float _cos = light.x;
        float _sin = light.y;
        d = (_cos * coord.x) + (_sin * coord.y * aspect);
    } else {
        float dx = coord.x - light.x / dimensions.x;
        float dy = (coord.y - light.y / dimensions.y) * aspect;
        float dis = sqrt(dx * dx + dy * dy) + 0.00001;
        d = dy / dis;
    }

    vec3 dir = vec3(d, d, 0.0);

    float noise = turb(dir + vec3(time, 0.0, 62.1 + time) * 0.05, vec3(480.0, 320.0, 480.0), lacunarity, gain);
    noise = mix(noise, 0.0, 0.3);
    //fade vertically.
    vec4 mist = vec4(noise, noise, noise, 1.0) * (1.0 - coord.y);
    mist.a = 1.0;
    // apply user alpha
    mist *= alpha;

    gl_FragColor = texture2D(uSampler, vTextureCoord) + mist;

}
`;const oe=class extends a.Filter{constructor(t){super(Ut,Ht.replace("${perlin}",Zt)),this.parallel=!0,this.time=0,this._angle=0,this.uniforms.dimensions=new Float32Array(2);const e=Object.assign(oe.defaults,t);this._angleLight=new a.Point,this.angle=e.angle,this.gain=e.gain,this.lacunarity=e.lacunarity,this.alpha=e.alpha,this.parallel=e.parallel,this.center=e.center,this.time=e.time}apply(t,e,r,i){const{width:o,height:s}=e.filterFrame;this.uniforms.light=this.parallel?this._angleLight:this.center,this.uniforms.parallel=this.parallel,this.uniforms.dimensions[0]=o,this.uniforms.dimensions[1]=s,this.uniforms.aspect=s/o,this.uniforms.time=this.time,this.uniforms.alpha=this.alpha,t.applyFilter(this,e,r,i)}get angle(){return this._angle}set angle(t){this._angle=t;const e=t*a.DEG_TO_RAD;this._angleLight.x=Math.cos(e),this._angleLight.y=Math.sin(e)}get gain(){return this.uniforms.gain}set gain(t){this.uniforms.gain=t}get lacunarity(){return this.uniforms.lacunarity}set lacunarity(t){this.uniforms.lacunarity=t}get alpha(){return this.uniforms.alpha}set alpha(t){this.uniforms.alpha=t}};let se=oe;se.defaults={angle:30,gain:.5,lacunarity:2.5,time:0,parallel:!0,center:[0,0],alpha:1};var Qt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Jt=`precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

// https://en.wikipedia.org/wiki/Luma_(video)
const vec3 weight = vec3(0.299, 0.587, 0.114);

void main()
{
    vec4 color = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(
        vec3(color.r * weight.r + color.g * weight.g  + color.b * weight.b),
        color.a
    );
}
`;class er extends a.Filter{constructor(){super(Qt,Jt)}}var tr=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,rr=`precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uHue;
uniform float uAlpha;
uniform bool uColorize;
uniform float uSaturation;
uniform float uLightness;

// https://en.wikipedia.org/wiki/Luma_(video)
const vec3 weight = vec3(0.299, 0.587, 0.114);

float getWeightedAverage(vec3 rgb) {
    return rgb.r * weight.r + rgb.g * weight.g + rgb.b * weight.b;
}

// https://gist.github.com/mairod/a75e7b44f68110e1576d77419d608786?permalink_comment_id=3195243#gistcomment-3195243
const vec3 k = vec3(0.57735, 0.57735, 0.57735);

vec3 hueShift(vec3 color, float angle) {
    float cosAngle = cos(angle);
    return vec3(
    color * cosAngle +
    cross(k, color) * sin(angle) +
    k * dot(k, color) * (1.0 - cosAngle)
    );
}

void main()
{
    vec4 color = texture2D(uSampler, vTextureCoord);
    vec4 result = color;

    // colorize
    if (uColorize) {
        result.rgb = vec3(getWeightedAverage(result.rgb), 0., 0.);
    }

    // hue
    result.rgb = hueShift(result.rgb, uHue);

    // saturation
    // https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/huesaturation.js
    float average = (result.r + result.g + result.b) / 3.0;

    if (uSaturation > 0.) {
        result.rgb += (average - result.rgb) * (1. - 1. / (1.001 - uSaturation));
    } else {
        result.rgb -= (average - result.rgb) * uSaturation;
    }

    // lightness
    result.rgb = mix(result.rgb, vec3(ceil(uLightness)) * color.a, abs(uLightness));

    // alpha
    gl_FragColor = mix(color, result, uAlpha);
}
`;const ae=class extends a.Filter{constructor(t){super(tr,rr),this._hue=0;const e=Object.assign({},ae.defaults,t);Object.assign(this,e)}get hue(){return this._hue}set hue(t){this._hue=t,this.uniforms.uHue=this._hue*(Math.PI/180)}get alpha(){return this.uniforms.uAlpha}set alpha(t){this.uniforms.uAlpha=t}get colorize(){return this.uniforms.uColorize}set colorize(t){this.uniforms.uColorize=t}get lightness(){return this.uniforms.uLightness}set lightness(t){this.uniforms.uLightness=t}get saturation(){return this.uniforms.uSaturation}set saturation(t){this.uniforms.uSaturation=t}};let ne=ae;ne.defaults={hue:0,saturation:0,lightness:0,colorize:!1,alpha:1};var ir=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,or=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform vec2 uVelocity;
uniform int uKernelSize;
uniform float uOffset;

const int MAX_KERNEL_SIZE = 2048;

// Notice:
// the perfect way:
//    int kernelSize = min(uKernelSize, MAX_KERNELSIZE);
// BUT in real use-case , uKernelSize < MAX_KERNELSIZE almost always.
// So use uKernelSize directly.

void main(void)
{
    vec4 color = texture2D(uSampler, vTextureCoord);

    if (uKernelSize == 0)
    {
        gl_FragColor = color;
        return;
    }

    vec2 velocity = uVelocity / filterArea.xy;
    float offset = -uOffset / length(uVelocity) - 0.5;
    int k = uKernelSize - 1;

    for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {
        if (i == k) {
            break;
        }
        vec2 bias = velocity * (float(i) / float(k) + offset);
        color += texture2D(uSampler, vTextureCoord + bias);
    }
    gl_FragColor = color / float(uKernelSize);
}
`;class sr extends a.Filter{constructor(e=[0,0],r=5,i=0){super(ir,or),this.kernelSize=5,this.uniforms.uVelocity=new Float32Array(2),this._velocity=new a.ObservablePoint(this.velocityChanged,this),this.setVelocity(e),this.kernelSize=r,this.offset=i}apply(e,r,i,o){const{x:s,y:n}=this.velocity;this.uniforms.uKernelSize=s!==0||n!==0?this.kernelSize:0,e.applyFilter(this,r,i,o)}set velocity(e){this.setVelocity(e)}get velocity(){return this._velocity}setVelocity(e){if(Array.isArray(e)){const[r,i]=e;this._velocity.set(r,i)}else this._velocity.copyFrom(e)}velocityChanged(){this.uniforms.uVelocity[0]=this._velocity.x,this.uniforms.uVelocity[1]=this._velocity.y,this.padding=(Math.max(Math.abs(this._velocity.x),Math.abs(this._velocity.y))>>0)+1}set offset(e){this.uniforms.uOffset=e}get offset(){return this.uniforms.uOffset}}var ar=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,nr=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float epsilon;

const int MAX_COLORS = %maxColors%;

uniform vec3 originalColors[MAX_COLORS];
uniform vec3 targetColors[MAX_COLORS];

void main(void)
{
    gl_FragColor = texture2D(uSampler, vTextureCoord);

    float alpha = gl_FragColor.a;
    if (alpha < 0.0001)
    {
      return;
    }

    vec3 color = gl_FragColor.rgb / alpha;

    for(int i = 0; i < MAX_COLORS; i++)
    {
      vec3 origColor = originalColors[i];
      if (origColor.r < 0.0)
      {
        break;
      }
      vec3 colorDiff = origColor - color;
      if (length(colorDiff) < epsilon)
      {
        vec3 targetColor = targetColors[i];
        gl_FragColor = vec4((targetColor + colorDiff) * alpha, alpha);
        return;
      }
    }
}
`;class lr extends a.Filter{constructor(e,r=.05,i=e.length){super(ar,nr.replace(/%maxColors%/g,i.toFixed(0))),this._replacements=[],this._maxColors=0,this.epsilon=r,this._maxColors=i,this.uniforms.originalColors=new Float32Array(i*3),this.uniforms.targetColors=new Float32Array(i*3),this.replacements=e}set replacements(e){const r=this.uniforms.originalColors,i=this.uniforms.targetColors,o=e.length;if(o>this._maxColors)throw new Error(`Length of replacements (${o}) exceeds the maximum colors length (${this._maxColors})`);r[o*3]=-1;for(let s=0;s<o;s++){const n=e[s];let l=n[0];typeof l=="number"?l=a.utils.hex2rgb(l):n[0]=a.utils.rgb2hex(l),r[s*3]=l[0],r[s*3+1]=l[1],r[s*3+2]=l[2];let u=n[1];typeof u=="number"?u=a.utils.hex2rgb(u):n[1]=a.utils.rgb2hex(u),i[s*3]=u[0],i[s*3+1]=u[1],i[s*3+2]=u[2]}this._replacements=e}get replacements(){return this._replacements}refresh(){this.replacements=this._replacements}get maxColors(){return this._maxColors}set epsilon(e){this.uniforms.epsilon=e}get epsilon(){return this.uniforms.epsilon}}var ur=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,cr=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec2 dimensions;

uniform float sepia;
uniform float noise;
uniform float noiseSize;
uniform float scratch;
uniform float scratchDensity;
uniform float scratchWidth;
uniform float vignetting;
uniform float vignettingAlpha;
uniform float vignettingBlur;
uniform float seed;

const float SQRT_2 = 1.414213;
const vec3 SEPIA_RGB = vec3(112.0 / 255.0, 66.0 / 255.0, 20.0 / 255.0);

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 Overlay(vec3 src, vec3 dst)
{
    // if (dst <= 0.5) then: 2 * src * dst
    // if (dst > 0.5) then: 1 - 2 * (1 - dst) * (1 - src)
    return vec3((dst.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x)),
                (dst.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y)),
                (dst.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z)));
}


void main()
{
    gl_FragColor = texture2D(uSampler, vTextureCoord);
    vec3 color = gl_FragColor.rgb;

    if (sepia > 0.0)
    {
        float gray = (color.x + color.y + color.z) / 3.0;
        vec3 grayscale = vec3(gray);

        color = Overlay(SEPIA_RGB, grayscale);

        color = grayscale + sepia * (color - grayscale);
    }

    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;

    if (vignetting > 0.0)
    {
        float outter = SQRT_2 - vignetting * SQRT_2;
        vec2 dir = vec2(vec2(0.5, 0.5) - coord);
        dir.y *= dimensions.y / dimensions.x;
        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);
        color.rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);
    }

    if (scratchDensity > seed && scratch != 0.0)
    {
        float phase = seed * 256.0;
        float s = mod(floor(phase), 2.0);
        float dist = 1.0 / scratchDensity;
        float d = distance(coord, vec2(seed * dist, abs(s - seed * dist)));
        if (d < seed * 0.6 + 0.4)
        {
            highp float period = scratchDensity * 10.0;

            float xx = coord.x * period + phase;
            float aa = abs(mod(xx, 0.5) * 4.0);
            float bb = mod(floor(xx / 0.5), 2.0);
            float yy = (1.0 - bb) * aa + bb * (2.0 - aa);

            float kk = 2.0 * period;
            float dw = scratchWidth / dimensions.x * (0.75 + seed);
            float dh = dw * kk;

            float tine = (yy - (2.0 - dh));

            if (tine > 0.0) {
                float _sign = sign(scratch);

                tine = s * tine / period + scratch + 0.1;
                tine = clamp(tine + 1.0, 0.5 + _sign * 0.5, 1.5 + _sign * 0.5);

                color.rgb *= tine;
            }
        }
    }

    if (noise > 0.0 && noiseSize > 0.0)
    {
        vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;
        pixelCoord.x = floor(pixelCoord.x / noiseSize);
        pixelCoord.y = floor(pixelCoord.y / noiseSize);
        // vec2 d = pixelCoord * noiseSize * vec2(1024.0 + seed * 512.0, 1024.0 - seed * 512.0);
        // float _noise = snoise(d) * 0.5;
        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;
        color += _noise * noise;
    }

    gl_FragColor.rgb = color;
}
`;const le=class extends a.Filter{constructor(t,e=0){super(ur,cr),this.seed=0,this.uniforms.dimensions=new Float32Array(2),typeof t=="number"?(this.seed=t,t=void 0):this.seed=e,Object.assign(this,le.defaults,t)}apply(t,e,r,i){var o,s;this.uniforms.dimensions[0]=(o=e.filterFrame)==null?void 0:o.width,this.uniforms.dimensions[1]=(s=e.filterFrame)==null?void 0:s.height,this.uniforms.seed=this.seed,t.applyFilter(this,e,r,i)}set sepia(t){this.uniforms.sepia=t}get sepia(){return this.uniforms.sepia}set noise(t){this.uniforms.noise=t}get noise(){return this.uniforms.noise}set noiseSize(t){this.uniforms.noiseSize=t}get noiseSize(){return this.uniforms.noiseSize}set scratch(t){this.uniforms.scratch=t}get scratch(){return this.uniforms.scratch}set scratchDensity(t){this.uniforms.scratchDensity=t}get scratchDensity(){return this.uniforms.scratchDensity}set scratchWidth(t){this.uniforms.scratchWidth=t}get scratchWidth(){return this.uniforms.scratchWidth}set vignetting(t){this.uniforms.vignetting=t}get vignetting(){return this.uniforms.vignetting}set vignettingAlpha(t){this.uniforms.vignettingAlpha=t}get vignettingAlpha(){return this.uniforms.vignettingAlpha}set vignettingBlur(t){this.uniforms.vignettingBlur=t}get vignettingBlur(){return this.uniforms.vignettingBlur}};let ue=le;ue.defaults={sepia:.3,noise:.3,noiseSize:1,scratch:.5,scratchDensity:.3,scratchWidth:1,vignetting:.3,vignettingAlpha:1,vignettingBlur:.3};var fr=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,dr=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterClamp;

uniform float uAlpha;
uniform vec2 uThickness;
uniform vec4 uColor;
uniform bool uKnockout;

const float DOUBLE_PI = 2. * 3.14159265358979323846264;
const float ANGLE_STEP = \${angleStep};

float outlineMaxAlphaAtPos(vec2 pos) {
    if (uThickness.x == 0. || uThickness.y == 0.) {
        return 0.;
    }

    vec4 displacedColor;
    vec2 displacedPos;
    float maxAlpha = 0.;

    for (float angle = 0.; angle <= DOUBLE_PI; angle += ANGLE_STEP) {
        displacedPos.x = vTextureCoord.x + uThickness.x * cos(angle);
        displacedPos.y = vTextureCoord.y + uThickness.y * sin(angle);
        displacedColor = texture2D(uSampler, clamp(displacedPos, filterClamp.xy, filterClamp.zw));
        maxAlpha = max(maxAlpha, displacedColor.a);
    }

    return maxAlpha;
}

void main(void) {
    vec4 sourceColor = texture2D(uSampler, vTextureCoord);
    vec4 contentColor = sourceColor * float(!uKnockout);
    float outlineAlpha = uAlpha * outlineMaxAlphaAtPos(vTextureCoord.xy) * (1.-sourceColor.a);
    vec4 outlineColor = vec4(vec3(uColor) * outlineAlpha, outlineAlpha);
    gl_FragColor = contentColor + outlineColor;
}
`;const z=class extends a.Filter{constructor(t=1,e=0,r=.1,i=1,o=!1){super(fr,dr.replace(/\$\{angleStep\}/,z.getAngleStep(r))),this._thickness=1,this._alpha=1,this._knockout=!1,this.uniforms.uThickness=new Float32Array([0,0]),this.uniforms.uColor=new Float32Array([0,0,0,1]),this.uniforms.uAlpha=i,this.uniforms.uKnockout=o,Object.assign(this,{thickness:t,color:e,quality:r,alpha:i,knockout:o})}static getAngleStep(t){const e=Math.max(t*z.MAX_SAMPLES,z.MIN_SAMPLES);return(Math.PI*2/e).toFixed(7)}apply(t,e,r,i){this.uniforms.uThickness[0]=this._thickness/e._frame.width,this.uniforms.uThickness[1]=this._thickness/e._frame.height,this.uniforms.uAlpha=this._alpha,this.uniforms.uKnockout=this._knockout,t.applyFilter(this,e,r,i)}get alpha(){return this._alpha}set alpha(t){this._alpha=t}get color(){return a.utils.rgb2hex(this.uniforms.uColor)}set color(t){a.utils.hex2rgb(t,this.uniforms.uColor)}get knockout(){return this._knockout}set knockout(t){this._knockout=t}get thickness(){return this._thickness}set thickness(t){this._thickness=t,this.padding=t}};let $=z;$.MIN_SAMPLES=1,$.MAX_SAMPLES=100;var hr=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,mr=`precision mediump float;

varying vec2 vTextureCoord;

uniform vec2 size;
uniform sampler2D uSampler;

uniform vec4 filterArea;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

vec2 pixelate(vec2 coord, vec2 size)
{
	return floor( coord / size ) * size;
}

void main(void)
{
    vec2 coord = mapCoord(vTextureCoord);

    coord = pixelate(coord, size);

    coord = unmapCoord(coord);

    gl_FragColor = texture2D(uSampler, coord);
}
`;class gr extends a.Filter{constructor(e=10){super(hr,mr),this.size=e}get size(){return this.uniforms.size}set size(e){typeof e=="number"&&(e=[e,e]),this.uniforms.size=e}}var vr=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,pr=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform float uRadian;
uniform vec2 uCenter;
uniform float uRadius;
uniform int uKernelSize;

const int MAX_KERNEL_SIZE = 2048;

void main(void)
{
    vec4 color = texture2D(uSampler, vTextureCoord);

    if (uKernelSize == 0)
    {
        gl_FragColor = color;
        return;
    }

    float aspect = filterArea.y / filterArea.x;
    vec2 center = uCenter.xy / filterArea.xy;
    float gradient = uRadius / filterArea.x * 0.3;
    float radius = uRadius / filterArea.x - gradient * 0.5;
    int k = uKernelSize - 1;

    vec2 coord = vTextureCoord;
    vec2 dir = vec2(center - coord);
    float dist = length(vec2(dir.x, dir.y * aspect));

    float radianStep = uRadian;
    if (radius >= 0.0 && dist > radius) {
        float delta = dist - radius;
        float gap = gradient;
        float scale = 1.0 - abs(delta / gap);
        if (scale <= 0.0) {
            gl_FragColor = color;
            return;
        }
        radianStep *= scale;
    }
    radianStep /= float(k);

    float s = sin(radianStep);
    float c = cos(radianStep);
    mat2 rotationMatrix = mat2(vec2(c, -s), vec2(s, c));

    for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {
        if (i == k) {
            break;
        }

        coord -= center;
        coord.y *= aspect;
        coord = rotationMatrix * coord;
        coord.y /= aspect;
        coord += center;

        vec4 sample = texture2D(uSampler, coord);

        // switch to pre-multiplied alpha to correctly blur transparent images
        // sample.rgb *= sample.a;

        color += sample;
    }

    gl_FragColor = color / float(uKernelSize);
}
`;class xr extends a.Filter{constructor(e=0,r=[0,0],i=5,o=-1){super(vr,pr),this._angle=0,this.angle=e,this.center=r,this.kernelSize=i,this.radius=o}apply(e,r,i,o){this.uniforms.uKernelSize=this._angle!==0?this.kernelSize:0,e.applyFilter(this,r,i,o)}set angle(e){this._angle=e,this.uniforms.uRadian=e*Math.PI/180}get angle(){return this._angle}get center(){return this.uniforms.uCenter}set center(e){this.uniforms.uCenter=e}get radius(){return this.uniforms.uRadius}set radius(e){(e<0||e===1/0)&&(e=-1),this.uniforms.uRadius=e}}var yr=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Cr=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;

uniform bool mirror;
uniform float boundary;
uniform vec2 amplitude;
uniform vec2 waveLength;
uniform vec2 alpha;
uniform float time;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void)
{
    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;
    vec2 coord = pixelCoord / dimensions;

    if (coord.y < boundary) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
        return;
    }

    float k = (coord.y - boundary) / (1. - boundary + 0.0001);
    float areaY = boundary * dimensions.y / filterArea.y;
    float v = areaY + areaY - vTextureCoord.y;
    float y = mirror ? v : vTextureCoord.y;

    float _amplitude = ((amplitude.y - amplitude.x) * k + amplitude.x ) / filterArea.x;
    float _waveLength = ((waveLength.y - waveLength.x) * k + waveLength.x) / filterArea.y;
    float _alpha = (alpha.y - alpha.x) * k + alpha.x;

    float x = vTextureCoord.x + cos(v * 6.28 / _waveLength - time) * _amplitude;
    x = clamp(x, filterClamp.x, filterClamp.z);

    vec4 color = texture2D(uSampler, vec2(x, y));

    gl_FragColor = color * _alpha;
}
`;const ce=class extends a.Filter{constructor(t){super(yr,Cr),this.time=0,this.uniforms.amplitude=new Float32Array(2),this.uniforms.waveLength=new Float32Array(2),this.uniforms.alpha=new Float32Array(2),this.uniforms.dimensions=new Float32Array(2),Object.assign(this,ce.defaults,t)}apply(t,e,r,i){var o,s;this.uniforms.dimensions[0]=(o=e.filterFrame)==null?void 0:o.width,this.uniforms.dimensions[1]=(s=e.filterFrame)==null?void 0:s.height,this.uniforms.time=this.time,t.applyFilter(this,e,r,i)}set mirror(t){this.uniforms.mirror=t}get mirror(){return this.uniforms.mirror}set boundary(t){this.uniforms.boundary=t}get boundary(){return this.uniforms.boundary}set amplitude(t){this.uniforms.amplitude[0]=t[0],this.uniforms.amplitude[1]=t[1]}get amplitude(){return this.uniforms.amplitude}set waveLength(t){this.uniforms.waveLength[0]=t[0],this.uniforms.waveLength[1]=t[1]}get waveLength(){return this.uniforms.waveLength}set alpha(t){this.uniforms.alpha[0]=t[0],this.uniforms.alpha[1]=t[1]}get alpha(){return this.uniforms.alpha}};let fe=ce;fe.defaults={mirror:!0,boundary:.5,amplitude:[0,20],waveLength:[30,100],alpha:[1,1],time:0};var _r=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,br=`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec2 red;
uniform vec2 green;
uniform vec2 blue;

void main(void)
{
   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/filterArea.xy).r;
   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/filterArea.xy).g;
   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/filterArea.xy).b;
   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;
}
`;class Sr extends a.Filter{constructor(e=[-10,0],r=[0,10],i=[0,0]){super(_r,br),this.red=e,this.green=r,this.blue=i}get red(){return this.uniforms.red}set red(e){this.uniforms.red=e}get green(){return this.uniforms.green}set green(e){this.uniforms.green=e}get blue(){return this.uniforms.blue}set blue(e){this.uniforms.blue=e}}var Tr=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Fr=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec4 filterClamp;

uniform vec2 center;

uniform float amplitude;
uniform float wavelength;
// uniform float power;
uniform float brightness;
uniform float speed;
uniform float radius;

uniform float time;

const float PI = 3.14159;

void main()
{
    float halfWavelength = wavelength * 0.5 / filterArea.x;
    float maxRadius = radius / filterArea.x;
    float currentRadius = time * speed / filterArea.x;

    float fade = 1.0;

    if (maxRadius > 0.0) {
        if (currentRadius > maxRadius) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
            return;
        }
        fade = 1.0 - pow(currentRadius / maxRadius, 2.0);
    }

    vec2 dir = vec2(vTextureCoord - center / filterArea.xy);
    dir.y *= filterArea.y / filterArea.x;
    float dist = length(dir);

    if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
        return;
    }

    vec2 diffUV = normalize(dir);

    float diff = (dist - currentRadius) / halfWavelength;

    float p = 1.0 - pow(abs(diff), 2.0);

    // float powDiff = diff * pow(p, 2.0) * ( amplitude * fade );
    float powDiff = 1.25 * sin(diff * PI) * p * ( amplitude * fade );

    vec2 offset = diffUV * powDiff / filterArea.xy;

    // Do clamp :
    vec2 coord = vTextureCoord + offset;
    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);
    vec4 color = texture2D(uSampler, clampedCoord);
    if (coord != clampedCoord) {
        color *= max(0.0, 1.0 - length(coord - clampedCoord));
    }

    // No clamp :
    // gl_FragColor = texture2D(uSampler, vTextureCoord + offset);

    color.rgb *= 1.0 + (brightness - 1.0) * p * fade;

    gl_FragColor = color;
}
`;const de=class extends a.Filter{constructor(t=[0,0],e,r=0){super(Tr,Fr),this.center=t,Object.assign(this,de.defaults,e),this.time=r}apply(t,e,r,i){this.uniforms.time=this.time,t.applyFilter(this,e,r,i)}get center(){return this.uniforms.center}set center(t){this.uniforms.center=t}get amplitude(){return this.uniforms.amplitude}set amplitude(t){this.uniforms.amplitude=t}get wavelength(){return this.uniforms.wavelength}set wavelength(t){this.uniforms.wavelength=t}get brightness(){return this.uniforms.brightness}set brightness(t){this.uniforms.brightness=t}get speed(){return this.uniforms.speed}set speed(t){this.uniforms.speed=t}get radius(){return this.uniforms.radius}set radius(t){this.uniforms.radius=t}};let he=de;he.defaults={amplitude:30,wavelength:160,brightness:1,speed:500,radius:-1};var Ar=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,zr=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uLightmap;
uniform vec4 filterArea;
uniform vec2 dimensions;
uniform vec4 ambientColor;
void main() {
    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);
    vec2 lightCoord = (vTextureCoord * filterArea.xy) / dimensions;
    vec4 light = texture2D(uLightmap, lightCoord);
    vec3 ambient = ambientColor.rgb * ambientColor.a;
    vec3 intensity = ambient + light.rgb;
    vec3 finalColor = diffuseColor.rgb * intensity;
    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;class wr extends a.Filter{constructor(e,r=0,i=1){super(Ar,zr),this._color=0,this.uniforms.dimensions=new Float32Array(2),this.uniforms.ambientColor=new Float32Array([0,0,0,i]),this.texture=e,this.color=r}apply(e,r,i,o){var s,n;this.uniforms.dimensions[0]=(s=r.filterFrame)==null?void 0:s.width,this.uniforms.dimensions[1]=(n=r.filterFrame)==null?void 0:n.height,e.applyFilter(this,r,i,o)}get texture(){return this.uniforms.uLightmap}set texture(e){this.uniforms.uLightmap=e}set color(e){const r=this.uniforms.ambientColor;typeof e=="number"?(a.utils.hex2rgb(e,r),this._color=e):(r[0]=e[0],r[1]=e[1],r[2]=e[2],r[3]=e[3],this._color=a.utils.rgb2hex(r))}get color(){return this._color}get alpha(){return this.uniforms.ambientColor[3]}set alpha(e){this.uniforms.ambientColor[3]=e}}var Pr=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Mr=`varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float blur;
uniform float gradientBlur;
uniform vec2 start;
uniform vec2 end;
uniform vec2 delta;
uniform vec2 texSize;

float random(vec3 scale, float seed)
{
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main(void)
{
    vec4 color = vec4(0.0);
    float total = 0.0;

    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));
    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;

    for (float t = -30.0; t <= 30.0; t++)
    {
        float percent = (t + offset - 0.5) / 30.0;
        float weight = 1.0 - abs(percent);
        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);
        sample.rgb *= sample.a;
        color += sample * weight;
        total += weight;
    }

    color /= total;
    color.rgb /= color.a + 0.00001;

    gl_FragColor = color;
}
`;class E extends a.Filter{constructor(e){var r,i;super(Pr,Mr),this.uniforms.blur=e.blur,this.uniforms.gradientBlur=e.gradientBlur,this.uniforms.start=(r=e.start)!=null?r:new a.Point(0,window.innerHeight/2),this.uniforms.end=(i=e.end)!=null?i:new a.Point(600,window.innerHeight/2),this.uniforms.delta=new a.Point(30,30),this.uniforms.texSize=new a.Point(window.innerWidth,window.innerHeight),this.updateDelta()}updateDelta(){this.uniforms.delta.x=0,this.uniforms.delta.y=0}get blur(){return this.uniforms.blur}set blur(e){this.uniforms.blur=e}get gradientBlur(){return this.uniforms.gradientBlur}set gradientBlur(e){this.uniforms.gradientBlur=e}get start(){return this.uniforms.start}set start(e){this.uniforms.start=e,this.updateDelta()}get end(){return this.uniforms.end}set end(e){this.uniforms.end=e,this.updateDelta()}}class me extends E{updateDelta(){const e=this.uniforms.end.x-this.uniforms.start.x,r=this.uniforms.end.y-this.uniforms.start.y,i=Math.sqrt(e*e+r*r);this.uniforms.delta.x=e/i,this.uniforms.delta.y=r/i}}class ge extends E{updateDelta(){const e=this.uniforms.end.x-this.uniforms.start.x,r=this.uniforms.end.y-this.uniforms.start.y,i=Math.sqrt(e*e+r*r);this.uniforms.delta.x=-r/i,this.uniforms.delta.y=e/i}}const ve=class extends a.Filter{constructor(t,e,r,i){super(),typeof t=="number"&&(a.utils.deprecation("5.3.0","TiltShiftFilter constructor arguments is deprecated, use options."),t={blur:t,gradientBlur:e,start:r,end:i}),t=Object.assign({},ve.defaults,t),this.tiltShiftXFilter=new me(t),this.tiltShiftYFilter=new ge(t)}apply(t,e,r,i){const o=t.getFilterTexture();this.tiltShiftXFilter.apply(t,e,o,1),this.tiltShiftYFilter.apply(t,o,r,i),t.returnFilterTexture(o)}get blur(){return this.tiltShiftXFilter.blur}set blur(t){this.tiltShiftXFilter.blur=this.tiltShiftYFilter.blur=t}get gradientBlur(){return this.tiltShiftXFilter.gradientBlur}set gradientBlur(t){this.tiltShiftXFilter.gradientBlur=this.tiltShiftYFilter.gradientBlur=t}get start(){return this.tiltShiftXFilter.start}set start(t){this.tiltShiftXFilter.start=this.tiltShiftYFilter.start=t}get end(){return this.tiltShiftXFilter.end}set end(t){this.tiltShiftXFilter.end=this.tiltShiftYFilter.end=t}};let pe=ve;pe.defaults={blur:100,gradientBlur:600,start:void 0,end:void 0};var Dr=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,kr=`varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float radius;
uniform float angle;
uniform vec2 offset;
uniform vec4 filterArea;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

vec2 twist(vec2 coord)
{
    coord -= offset;

    float dist = length(coord);

    if (dist < radius)
    {
        float ratioDist = (radius - dist) / radius;
        float angleMod = ratioDist * ratioDist * angle;
        float s = sin(angleMod);
        float c = cos(angleMod);
        coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
    }

    coord += offset;

    return coord;
}

void main(void)
{

    vec2 coord = mapCoord(vTextureCoord);

    coord = twist(coord);

    coord = unmapCoord(coord);

    gl_FragColor = texture2D(uSampler, coord );

}
`;const xe=class extends a.Filter{constructor(t){super(Dr,kr),Object.assign(this,xe.defaults,t)}get offset(){return this.uniforms.offset}set offset(t){this.uniforms.offset=t}get radius(){return this.uniforms.radius}set radius(t){this.uniforms.radius=t}get angle(){return this.uniforms.angle}set angle(t){this.uniforms.angle=t}};let ye=xe;ye.defaults={radius:200,angle:4,padding:20,offset:new a.Point};var Or=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Rr=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform vec2 uCenter;
uniform float uStrength;
uniform float uInnerRadius;
uniform float uRadius;

const float MAX_KERNEL_SIZE = \${maxKernelSize};

// author: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(vec2 co, float seed) {
    const highp float a = 12.9898, b = 78.233, c = 43758.5453;
    highp float dt = dot(co + seed, vec2(a, b)), sn = mod(dt, 3.14159);
    return fract(sin(sn) * c + seed);
}

void main() {

    float minGradient = uInnerRadius * 0.3;
    float innerRadius = (uInnerRadius + minGradient * 0.5) / filterArea.x;

    float gradient = uRadius * 0.3;
    float radius = (uRadius - gradient * 0.5) / filterArea.x;

    float countLimit = MAX_KERNEL_SIZE;

    vec2 dir = vec2(uCenter.xy / filterArea.xy - vTextureCoord);
    float dist = length(vec2(dir.x, dir.y * filterArea.y / filterArea.x));

    float strength = uStrength;

    float delta = 0.0;
    float gap;
    if (dist < innerRadius) {
        delta = innerRadius - dist;
        gap = minGradient;
    } else if (radius >= 0.0 && dist > radius) { // radius < 0 means it's infinity
        delta = dist - radius;
        gap = gradient;
    }

    if (delta > 0.0) {
        float normalCount = gap / filterArea.x;
        delta = (normalCount - delta) / normalCount;
        countLimit *= delta;
        strength *= delta;
        if (countLimit < 1.0)
        {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
            return;
        }
    }

    // randomize the lookup values to hide the fixed number of samples
    float offset = rand(vTextureCoord, 0.0);

    float total = 0.0;
    vec4 color = vec4(0.0);

    dir *= strength;

    for (float t = 0.0; t < MAX_KERNEL_SIZE; t++) {
        float percent = (t + offset) / MAX_KERNEL_SIZE;
        float weight = 4.0 * (percent - percent * percent);
        vec2 p = vTextureCoord + dir * percent;
        vec4 sample = texture2D(uSampler, p);

        // switch to pre-multiplied alpha to correctly blur transparent images
        // sample.rgb *= sample.a;

        color += sample * weight;
        total += weight;

        if (t > countLimit){
            break;
        }
    }

    color /= total;
    // switch back from pre-multiplied alpha
    // color.rgb /= color.a + 0.00001;

    gl_FragColor = color;
}
`,Ce=Object.getOwnPropertySymbols,$r=Object.prototype.hasOwnProperty,Er=Object.prototype.propertyIsEnumerable,jr=(t,e)=>{var r={};for(var i in t)$r.call(t,i)&&e.indexOf(i)<0&&(r[i]=t[i]);if(t!=null&&Ce)for(var i of Ce(t))e.indexOf(i)<0&&Er.call(t,i)&&(r[i]=t[i]);return r};const _e=class extends a.Filter{constructor(t){const e=Object.assign(_e.defaults,t),{maxKernelSize:r}=e,i=jr(e,["maxKernelSize"]);super(Or,Rr.replace("${maxKernelSize}",r.toFixed(1))),Object.assign(this,i)}get center(){return this.uniforms.uCenter}set center(t){this.uniforms.uCenter=t}get strength(){return this.uniforms.uStrength}set strength(t){this.uniforms.uStrength=t}get innerRadius(){return this.uniforms.uInnerRadius}set innerRadius(t){this.uniforms.uInnerRadius=t}get radius(){return this.uniforms.uRadius}set radius(t){(t<0||t===1/0)&&(t=-1),this.uniforms.uRadius=t}};let be=_e;return be.defaults={strength:.1,center:[0,0],innerRadius:0,radius:-1,maxKernelSize:32},f.AdjustmentFilter=ke,f.AdvancedBloomFilter=N,f.AsciiFilter=Ne,f.BevelFilter=Xe,f.BloomFilter=qe,f.BulgePinchFilter=B,f.CRTFilter=H,f.ColorGradientFilter=A,f.ColorMapFilter=yt,f.ColorOverlayFilter=bt,f.ColorReplaceFilter=Ft,f.ConvolutionFilter=wt,f.CrossHatchFilter=Dt,f.DotFilter=Et,f.DropShadowFilter=te,f.EmbossFilter=Xt,f.GlitchFilter=b,f.GlowFilter=ie,f.GodrayFilter=se,f.GrayscaleFilter=er,f.HslAdjustmentFilter=ne,f.KawaseBlurFilter=T,f.MotionBlurFilter=sr,f.MultiColorReplaceFilter=lr,f.OldFilmFilter=ue,f.OutlineFilter=$,f.PixelateFilter=gr,f.RGBSplitFilter=Sr,f.RadialBlurFilter=xr,f.ReflectionFilter=fe,f.ShockwaveFilter=he,f.SimpleLightmapFilter=wr,f.TiltShiftAxisFilter=E,f.TiltShiftFilter=pe,f.TiltShiftXFilter=me,f.TiltShiftYFilter=ge,f.TwistFilter=ye,f.ZoomBlurFilter=be,Object.defineProperty(f,"__esModule",{value:!0}),f}({},PIXI,PIXI.filters,PIXI.filters);Object.assign(PIXI.filters,__filters);
//# sourceMappingURL=pixi-filters.js.map
