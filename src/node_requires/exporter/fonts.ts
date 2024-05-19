const fs = require('fs-extra');

import {getPathToTtf} from '../resources/fonts';

export const stringifyFont = (font: IFont, typeface: ITypeface): string => `
@font-face {
    font-family: '${font.name}';
    src: url('fonts/${typeface.uid}.woff') format('woff'),
         url('fonts/${typeface.uid}.ttf') format('truetype');
    font-weight: ${typeface.weight};
    font-style: ${typeface.italic ? 'italic' : 'normal'};
}`;

type fontsBundleResult = {
    css: string;
    js: string;
};
export const bundleFonts = async function (
    input: IFont[],
    projdir: string,
    writeDir: string
): Promise<fontsBundleResult> {
    let css = '',
        js = '';
    const writePromises: Promise<void>[] = [];
    if (input) {
        js += 'if (document.fonts) { for (const font of document.fonts) { font.load(); }}';
        await fs.ensureDir(writeDir + '/fonts');
        const ttf2woff = require('ttf2woff');
        const promises: Promise<string>[] = [];
        for (const font of input) {
            promises.push(...font.typefaces.map(async typeface => {
                const fontData = await fs.readFile(getPathToTtf(typeface, true));
                var ttf = new Uint8Array(fontData);
                let woff;
                try {
                    woff = Buffer.from(ttf2woff(ttf).buffer);
                } catch (e) {
                    window.alertify.error(`Whoah! A buggy ttf file in the font ${font.name} ${typeface.weight} ${typeface.italic ? 'italic' : 'normal'}. You should either fix it or find a new one.`);
                    throw e;
                }
                await Promise.all([
                    writePromises.push(fs.copy(getPathToTtf(typeface, true), writeDir + '/fonts/' + typeface.uid + '.ttf')),
                    writePromises.push(fs.writeFile(writeDir + '/fonts/' + typeface.uid + '.woff', woff))
                ]);
                return stringifyFont(font, typeface);
            }));
        }
        css += (await Promise.all(promises)).join('\n\n');
    }

    await Promise.all(writePromises);
    return {
        css,
        js
    };
};

const charSets: Record<Exclude<builtinCharsets, 'allInFont'>, string> = {
    punctuation: ' !"#$%&\'()*+,-./0123456789:;<=>?@[\\]^_`{|}~',
    basicLatin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    latinExtended: 'ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠơƢƣƤƥƦƧƨƩƪƫƬƭƮƯưƱƲƳƴƵƶƷƸƹƺƻƼƽƾƿǀǁǂǃǄǅǆǇǈǉǊǋǌǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜǝǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǶǷǸǹǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗȘșȚțȜȝȞȟȠȡȢȣȤȥȦȧȨȩȪȫȬȭȮȯȰȱȲȳȴȵȶȷȸȹȺȻȼȽȾȿɀɁɂɃɄɅɆɇɈɉɊɋɌɍɎɏ',
    cyrillic: '«»ЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяѐёђѓєѕіїјљњћќѝўџѠѡѢѣѤѥѦѧѨѩѪѫѬѭѮѯѰѱѲѳѴѵѶѷѸѹѺѻѼѽѾѿҀҁ҂о҃о҄о҅о҆о҇о҈о҉ҊҋҌҍҎҏҐґҒғҔҕҖҗҘҙҚқҜҝҞҟҠҡҢңҤҥҦҧҨҩҪҫҬҭҮүҰұҲҳҴҵҶҷҸҹҺһҼҽҾҿӀӁӂӃӄӅӆӇӈӉӊӋӌӍӎӏӐӑӒӓӔӕӖӗӘәӚӛӜӝӞӟӠӡӢӣӤӥӦӧӨөӪӫӬӭӮӯӰӱӲӳӴӵӶӷӸӹӺӻӼӽӾӿԀԁԂԃԄԅԆԇԈԉԊԋԌԍԎԏԔԕԖԗԘԙԚԛԜԝԞԟԠԡԢԣԤԥԦԧԨԩԪԫԬԭԮԯ',
    greekCoptic: 'ͰͱͲͳʹ͵Ͷͷͺͻͼͽ;΄΅Ά·ΈΉΊΌΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώϏϐϑϒϓϔϕϖϗϘϙϚϛϜϝϞϟϠϡϢϣϤϥϦϧϨϩϪϫϬϭϮϯϰϱϲϳϴϵ϶ϷϸϹϺϻϼϽϾϿ',
    custom: ''
};

const specialCharMap: Record<number, string> = {
    38: '&amp;',
    60: '&lt;',
    32: 'space',
    62: '&gt;',
    34: '&quot;'
};
const charCodeToXMLChar = (code: number): string => {
    if (code in specialCharMap) {
        return specialCharMap[code];
    }
    return String.fromCharCode(code);
};

export const generateXML = function generateXML(
    fontData: any,
    ctFont: IFont,
    typeface: ITypeface
): string {
    let XMLTemplate = `<font>
    <info face="${ctFont.name}" size="${ctFont.bitmapFontSize}" bold="${typeface.weight}" italic="${typeface.italic ? '1' : '0'}" charset="" unicode="0" stretchH="100" smooth="1" aa="1" padding="0,0,0,0" spacing="1,1"/>
    <common lineHeight="${ctFont.bitmapFontLineHeight}" base="${ctFont.bitmapFontSize}" scaleW="${fontData.canvas.width}" scaleH="${fontData.canvas.height}" pages="1" packed="0"/>
    <pages>
        <page id="0" file="${typeface.uid}.png"/>
    </pages>
    <chars count="${Object.keys(fontData.map).length}">`;

    for (const key in fontData.map) {
        const c = fontData.map[key];
        XMLTemplate += `\n        <char id="${key}" x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" xoffset="0" yoffset="0" xadvance="${c.width}" page="0" chnl="0" letter="${charCodeToXMLChar(Number(key))}"/>`;
    }

    XMLTemplate += `
    </chars>
    <kernings count="0"></kernings>
</font>`;

    return XMLTemplate;
};

/**
 * @returns {Promise<string[]>} A promise that resolves into an array of file paths to fonts' XML.
 */
export const bakeBitmapFonts = async (
    input: IFont[],
    projdir: string,
    writeDir: string
): Promise<string[]> => {
    const generator = require('./../resources/fonts/bitmapFontGenerator');
    const path = require('path');
    const bitmappableFonts = input.filter(font => font.bitmapFont);
    const fontsMetadataUnflattened = await Promise.all(bitmappableFonts.map((font) => {
        const fCharsets = font.charsets || ['basicLatin'];
        let letterList;
        if (fCharsets.length === 1 && fCharsets[0] === 'allInFont') {
            letterList = false;
        } else {
            letterList = fCharsets.reduce((
                acc: string,
                charset: Exclude<builtinCharsets, 'allInFont'>
            ) => acc + (charSets[charset] || ''), '');
        }
        if (fCharsets.indexOf('custom') !== -1) {
            letterList += font.customCharset!;
        }
        const settings = {
            fill: '#ffffff',
            // stroke: '#000000',l
            list: letterList,
            height: font.bitmapFontSize,
            margin: 2
        };
        return Promise.all(font.typefaces.map(async (typeface: ITypeface) => {
            const xmlPath = `${font.uid}.xml`,
                  pngPath = `${font.uid}.png`;
            const fontPath = getPathToTtf(typeface, true);
            const drawData = await generator(fontPath, path.join(writeDir, `${typeface.uid}.png`), settings);
            const xml = generateXML(drawData, font, typeface);
            await fs.writeFile(path.join(writeDir, `${font.uid}.xml`), xml, 'utf8');
            return {
                xmlPath,
                pngPath,
                typefaceName: font.name,
                weight: typeface.weight,
                italic: typeface.italic
            };
        }));
    }));
    const fontsMetadata = fontsMetadataUnflattened.flat(1);
    const bitmapFontsXML = fontsMetadata.map(m => m.xmlPath);
    return bitmapFontsXML;
};
