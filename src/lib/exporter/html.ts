import {getOfType} from '../resources';

const ifHTMLMatcher = (varName: string, symbol = '@') => new RegExp(`<!-- ?if +${symbol}${varName}${symbol} ?-->([\\s\\S]*)(?:<!-- ?else +${symbol}${varName}${symbol} ?-->([\\s\\S]*?))?<!-- ?endif +${symbol}${varName}${symbol} ?-->`, 'g');
const varHTMLMatcher = (varName: string, symbol = '@') => new RegExp(`<!-- ?${symbol}${varName}${symbol} ?-->`, 'g');

/**
 * A little home-brewn string templating function for HTML.
 * Example of a variable mark: <!-- @variable@ --> and <!-- %variable% --> for injections.
 *
 * Example of if/else:
 * <!-- if @variable@ -->
 *    (code)
 * <!-- else @variable@ -->
 *    (code)
 * <!-- endif @variable@ -->
 *
 * Injections use %variable% instead of @variable@.
 * In if/else blocks, empty arrays are treated as `false`.
 *
 * @param {string} input The source string with template tags
 * @param {Record<string,string|Array|object>} vars The variables to substitute
 * @param {Record<string,string|Array|object>} injections Module-provided injections to substitute
 */
const templateHTML = (
    input: string,
    vars: Record<string, unknown>,
    injections: Record<string, unknown> = {}
) => {
    let output = input;
    for (const i in vars) {
        output = output.replace(varHTMLMatcher(i), () => (typeof vars[i] === 'object' ? JSON.stringify(vars[i]) : (vars[i] as string)));
        output = output.replace(ifHTMLMatcher(i), (Array.isArray(vars[i]) ? (vars[i] as []).length : vars[i]) ? '$1' : '$2');
    }
    for (const i in injections) {
        output = output.replace(varHTMLMatcher(i, '%'), () => (typeof injections[i] === 'object' ? JSON.stringify(injections[i]) : (injections[i] as string)));
    }
    return output;
};

const logoMadeWith = `
<svg width="1035" height="894" viewBox="0 0 1035 894" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M523 222l-2 7a18 18 0 01-11 9 30 30 0 01-17 0 18 18 0 01-11-10c-2-2-3-5-3-8l1-4 4-2c1-1 3 0 4 1l2 3 1 5a8 8 0 005 4l5 1 6-1 2-1 2-2 1-4 3-4h4l3 2c1 1 2 3 1 4zm-39-111c12 3 3 25-1 35-3 10-11 33-21 31-9-2-6-25-2-39 5-15 13-30 24-27zM257 556c-19-47 19-174 67-296l20-46C396 97 450 25 505 0a180 180 0 00-1 69 362 362 0 01120 21c18-14 34-24 48-30s33-10 57-12c-39 123-60 209-63 255-7 115 3 189 6 221 14 2 29 1 50-7 13-5 29-19 24-42-3-15-23-18-35-16-5 0-15-1-18-9-2-9 5-16 11-18 13-6 41-10 60 8 17 16 18 39 14 57-3 17-15 29-25 37-20 15-53 24-80 28-1 18-17 25-29 31-39 17-111 26-186 22-108-4-188-25-201-59zm326-430c12 3 5 25 2 35-4 10-12 33-21 31-10-2-7-26-2-40 4-14 10-29 21-26z" fill="currentColor"/>
    <path d="M93 709c3 0 5 2 6 7a2334 2334 0 01-2 124l-8 2c-4 0-5-2-5-6v-45a656 656 0 00-1-38c-5 8-11 15-18 20-8 5-16 7-25 7s-17-4-23-11a902 902 0 00-1 64c0 3-1 5-3 7l-7 2c-4 0-6-2-6-6V722c0-2 1-5 3-7 1-2 3-3 5-3l6 2c2 1 2 3 3 5 0 15 3 26 7 33s9 11 15 11a36 36 0 0025-10c3-3 6-6 8-11 4-6 7-15 11-24 2-6 5-9 10-9zM172 749c6 0 9 5 9 15v30l3 45c0 4-4 5-11 5h-3c-1 0-2 0-3-2v-4-6c-7 7-15 10-25 10-19 0-28-15-28-44 0-16 3-28 9-36s15-13 26-13c5 0 11 1 16 3 2-2 4-3 7-3zm-20 18c-8 0-14 2-17 6-4 5-6 13-6 25 0 19 5 29 16 29 3 0 6-1 9-4 4-2 6-5 7-8 3-7 4-15 4-24 0-8-1-15-3-18-2-4-6-6-10-6zM243 748l-1-38c0-7 3-11 7-11 5 0 8 2 8 6l1 31a2026 2026 0 003 101c0 4-3 6-9 6-4 0-6-2-6-8-5 5-12 7-20 7-10 0-18-4-25-11-6-8-9-17-9-28s2-21 7-31c4-9 11-16 21-20a43 43 0 0123-4zm1 28l-4-7-4-3h-6l-7 2c-3 2-6 4-8 8a44 44 0 00-2 42c3 5 8 8 13 8 6 0 11-3 14-9 4-6 5-13 5-22l-1-19zM302 749c7 0 13 2 20 7 6 4 9 9 9 15s-2 12-7 18c-6 5-13 9-21 10l-17 1c1 11 4 18 9 22l5 2c8 0 15-2 21-8 5-5 9-8 12-8l5 3 3 6c0 3-4 8-13 15l-13 8-15 3c-12 0-20-8-26-23-3-9-5-19-5-30s3-21 8-29 13-12 25-12zm1 14c-5 0-10 3-13 9-2 2-3 6-4 13 18 0 28-4 28-13 0-6-4-9-11-9zM415 842c-4 0-9-9-13-27-4-17-6-37-6-59 0-2 1-4 3-5 2-2 3-2 5-2l4 1 1 4c0 21 4 41 11 60l5-10 6-10c2-3 5-4 8-4 2 0 5 2 8 6l8 14 4 7c4-11 5-21 5-31l-1-30c0-2 1-4 3-5l6-3c4 0 6 8 6 23v11c0 18-3 34-9 48-3 8-6 12-11 12-2 0-4-2-7-5l-7-14-6-12-6 11-5 11-5 6c-2 2-5 3-7 3zM504 716c3 0 5 1 7 3s3 5 3 7c0 3-1 5-3 8l-7 3c-3 0-5-1-7-3s-3-5-3-8c0-6 3-10 10-10zm9 104v14c0 3-1 5-3 7l-6 2c-4 0-6-1-6-5a4177 4177 0 01-2-87c1-2 2-4 5-4 7 0 11 3 12 9l1 7-1 13v44zM541 749h14v-41c0-3 1-5 3-6l6-3 4 2a1986 1986 0 001 47h24c4 0 6 2 6 7 0 3-1 6-3 7-2 2-4 3-7 3h-19a611 611 0 005 73c0 2-1 2-2 3l-7 1c-3 0-5-1-5-5-3-17-5-41-6-72l-13 1c-8 0-12-3-12-7 0-7 3-10 11-10zM626 777l2 47-1 11c0 2-1 4-3 5-1 2-3 2-7 2-2 0-3-1-4-3l-2-8-4-66-2-57c0-3 1-5 3-7l7-2c3 0 6 3 6 9l2 24v21c7-3 14-5 20-5 16 0 26 7 30 21 2 7 3 17 3 29a231 231 0 01-2 36c0 3-1 5-3 6l-7 2c-4 0-6-2-6-6l2-35-1-14c0-7-1-13-4-17-2-4-6-6-13-6-11 0-16 5-16 13zM732 795c0-9 2-17 7-24a47 47 0 0156-19c4 1 7 3 7 6s-1 5-3 8c-1 3-3 4-6 4l-8-2-8-2c-7 0-14 2-19 8-6 6-9 13-9 23 0 9 2 16 5 21 3 4 8 6 15 6 3 0 8-1 15-5l14-5 4 2 2 4c0 3-3 6-7 10a52 52 0 01-31 12c-11 0-19-4-25-12-6-9-9-20-9-35zM817 749h14v-41c0-3 1-5 3-6l6-3 5 2a1978 1978 0 001 47h24c4 0 6 2 6 7 0 3-1 6-4 7l-6 3h-19a610 610 0 005 73l-3 3-7 1c-2 0-4-1-5-5-2-17-4-41-5-72l-14 1c-8 0-12-3-12-7 0-7 4-10 11-10zM895 818c3 0 5 1 7 3 3 2 4 5 4 9 0 3-1 6-3 8-2 3-5 4-8 4l-7-2c-2-2-4-4-4-8l3-9c3-3 5-5 8-5zM938 717c3 0 5 1 7 3s3 5 3 7c0 3-1 5-3 8-2 2-5 3-7 3-3 0-5-1-7-3s-3-5-3-8c0-6 3-10 10-10zm-6 39c0-2 0-4 2-5 2-2 5-3 8-3s5 2 6 5a413 413 0 01-5 125c-5 11-13 16-25 16-6 0-11-2-15-6-5-3-7-8-7-13 0-3 1-5 3-6 2-2 4-3 7-3l5 2 2 4c2 4 4 6 7 6 4 0 6-3 9-8a319 319 0 006-50c-1-31-1-52-3-64zM974 774c0-8 3-14 9-19 5-4 12-7 19-7 8 0 15 2 21 4 7 3 11 6 11 11 0 2-1 4-3 5-2 2-3 2-5 2h-3l-8-4-12-3c-4 0-7 1-10 3s-4 4-4 8 1 7 4 9l17 6c8 1 14 3 18 6s6 8 6 16c0 11-2 19-8 23-6 5-13 7-21 7-9 0-16-1-22-3-5-3-8-6-8-11s2-7 8-7l8 2c5 2 9 3 14 3 4 0 8-1 10-4s4-6 4-10-2-6-5-8-8-3-14-4-11-2-14-4c-8-3-12-10-12-21z" fill="currentColor"/>
</svg>`;
const logoPlain = `
<svg width="1682" height="925" viewBox="0 0 1682 925" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1136 582C1140 584 1145 585 1150 586C1157 585 1164 583 1169 578C1178 570 1185 561 1191 550C1194 544 1199 539 1206 536C1213 534 1220 535 1226 538C1233 541 1237 546 1240 553C1242 560 1241 567 1238 573C1230 590 1218 606 1204 618C1189 631 1170 638 1150 639C1135 638 1121 635 1108 628C1098 621 1090 611 1086 599C1082 589 1081 578 1081 567C1081 553 1083 539 1086 525C1089 509 1093 494 1097 478C1108 443 1120 409 1135 375C1148 343 1163 312 1179 281C1185 269 1192 257 1200 245C1205 236 1212 227 1219 219C1223 214 1230 210 1237 210C1244 209 1251 212 1256 216C1261 221 1265 227 1265 234C1266 241 1263 248 1259 254C1253 260 1249 266 1245 273C1238 283 1232 295 1226 306C1210 335 1196 365 1183 395C1170 427 1158 460 1148 493C1144 507 1141 521 1138 536C1136 547 1134 558 1134 569C1134 573 1135 578 1136 582Z" fill="currentColor"/>
    <path d="M1108 368C1103 368 1098 365 1094 361C1091 357 1089 352 1089 347C1089 342 1092 337 1095 333C1099 330 1104 328 1110 328C1139 329 1169 328 1199 325C1216 323 1247 316 1265 309C1282 303 1302 301 1299 323C1296 339 1285 346 1275 350C1253 358 1214 364 1203 365C1170 365 1140 369 1108 368Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1490 612C1486 615 1482 618 1477 621C1462 631 1445 639 1428 644C1415 648 1403 651 1390 654C1385 655 1380 656 1376 658C1368 676 1361 694 1353 713C1340 743 1324 773 1307 802C1300 814 1291 826 1282 838C1274 848 1265 858 1255 866C1247 873 1238 877 1229 880C1220 882 1210 884 1201 884C1181 884 1162 878 1146 866C1137 858 1130 849 1126 838C1121 827 1118 814 1119 802C1119 802 1119 801 1119 801L1119 797C1119 796 1119 796 1119 796C1120 769 1129 744 1146 723C1158 708 1172 695 1188 684C1221 661 1258 641 1296 627C1309 622 1322 617 1336 613C1339 606 1342 598 1344 590L1383 482C1394 450 1406 418 1417 385C1428 357 1439 329 1451 301C1454 295 1459 290 1466 287C1472 285 1480 285 1486 288C1492 290 1498 296 1500 302C1503 309 1503 316 1500 322C1488 349 1477 376 1467 404L1433 500L1398 598C1403 596 1407 595 1412 594C1425 590 1437 584 1448 577C1453 573 1458 570 1462 565C1464 563 1466 560 1469 558C1475 553 1483 550 1491 550C1499 551 1507 554 1513 560C1515 562 1518 564 1520 567C1525 573 1530 578 1537 582C1539 584 1541 585 1544 585C1549 587 1554 587 1559 587C1566 588 1573 585 1579 581C1582 578 1584 574 1585 571C1588 564 1589 556 1589 548C1589 548 1589 548 1589 548L1589 547C1589 538 1588 530 1585 523C1581 513 1577 504 1572 495C1565 481 1558 467 1553 453C1551 445 1550 438 1550 431C1550 407 1561 384 1581 370C1592 362 1606 358 1620 358C1633 358 1645 361 1655 369C1667 377 1675 389 1679 402C1680 406 1681 410 1681 414C1682 423 1680 432 1674 439C1669 446 1661 450 1652 451C1639 452 1627 445 1621 433C1618 426 1619 418 1622 411C1621 411 1621 411 1620 411C1617 411 1614 412 1611 413C1606 417 1603 424 1603 430C1603 432 1603 434 1604 436C1608 448 1613 459 1619 470C1625 481 1630 492 1634 504C1639 517 1642 532 1642 546C1642 546 1642 546 1642 547V548C1642 562 1640 576 1635 589C1631 601 1624 611 1615 620C1599 634 1579 641 1558 640C1548 640 1539 639 1530 636C1521 634 1513 631 1506 626C1500 621 1495 617 1490 612ZM1310 678C1277 691 1246 708 1218 728C1206 735 1196 745 1187 755C1178 768 1173 783 1172 798L1172 803C1172 808 1173 813 1174 818C1176 820 1177 822 1180 824C1185 829 1193 831 1200 831C1205 831 1210 830 1214 829C1217 828 1219 827 1221 825C1228 819 1235 812 1241 805C1248 795 1255 785 1262 774C1278 748 1292 720 1304 692C1306 687 1308 683 1310 678Z" fill="currentColor"/>
    <path d="M1497 263C1514 263 1527 249 1527 233C1527 216 1514 203 1497 203C1481 203 1467 216 1467 233C1467 249 1481 263 1497 263Z" fill="currentColor"/>
    <path d="M1295 604C1313 604 1328 589 1328 571C1328 552 1313 537 1295 537C1276 537 1261 552 1261 571C1261 589 1276 604 1295 604Z" fill="currentColor"/>
    <path d="M1003 433C1004 427 1008 421 1013 417C1012 416 1012 416 1012 415C1011 414 1010 413 1008 413L1004 412C1000 413 996 414 992 416C985 420 978 424 972 429C972 429 972 429 971 429L971 429C958 439 947 450 939 464C928 480 920 498 915 517C913 523 913 529 913 535C913 543 915 552 918 559C922 566 927 571 933 576C949 586 967 592 986 592C998 592 1010 589 1022 584C1039 576 1054 565 1067 551C1072 546 1077 541 1081 535C1083 533 1084 531 1085 529C1087 522 1091 517 1098 513C1104 510 1111 510 1118 512C1124 514 1130 518 1133 525C1137 531 1137 538 1135 545C1133 553 1129 560 1123 567C1118 575 1112 582 1105 589C1087 607 1067 621 1044 632C1026 641 1006 645 986 645C956 645 927 636 903 619C890 610 879 598 872 584C864 569 859 552 860 535C860 525 861 514 863 504C869 479 880 456 894 434C907 416 922 399 940 386C940 386 940 386 940 386L941 386C949 380 958 374 967 369C979 363 991 360 1004 359C1005 359 1006 359 1006 359L1013 360C1013 360 1014 360 1014 360C1032 362 1048 372 1057 388C1064 399 1067 412 1067 426C1067 432 1067 438 1065 443C1062 453 1055 462 1046 466C1044 466 1041 467 1039 467L1037 468C1036 468 1036 468 1035 468C1028 469 1020 466 1014 461C1008 456 1004 449 1003 441C1003 439 1003 437 1003 435L1003 433Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M407 333C407 337 405 341 403 344C402 347 399 350 396 352C394 354 390 356 387 357C383 358 378 359 374 359C370 359 366 358 361 357C358 356 355 354 352 351C349 349 347 346 345 343C343 339 342 334 341 330C341 328 341 326 343 324C344 322 346 321 348 321C350 320 352 321 354 322C356 324 357 325 357 328C358 330 359 333 360 335C360 337 361 338 363 339C364 340 365 340 366 341C369 342 371 342 374 342C377 342 380 342 382 341C384 340 385 340 386 339C387 338 388 337 389 336C390 334 391 332 391 330C392 328 393 326 395 325C397 324 399 323 401 324C403 324 405 325 406 327C407 329 408 331 407 333ZM349 166C366 171 353 205 348 220C342 235 330 269 316 266C301 263 306 228 313 207C320 185 332 162 349 166ZM8 834C-19 763 36 574 109 391C119 366 128 343 138 321C216 145 297 39 380 0C376 34 374 57 375 70C375 82 377 94 378 103C404 103 435 105 470 111C505 116 534 124 559 135C586 115 610 100 631 91C652 82 681 76 716 72C657 257 626 385 622 455C611 626 627 738 630 787C652 790 674 787 706 775C725 768 750 747 742 712C737 689 707 685 689 688C681 689 666 687 663 675C659 662 670 652 679 648C699 639 740 633 769 660C795 684 795 719 790 745C786 770 767 790 752 801C723 824 673 838 633 844C630 871 607 881 589 889C531 915 422 928 310 923C147 916 27 885 8 834ZM498 189C515 193 505 227 500 242C494 257 482 291 468 288C453 285 458 250 465 229C472 208 480 184 498 189Z" fill="currentColor"/>
</svg>
`;

type Filenames = {
    cssBundle: string;
    jsBundle: string;
    iconRevision: string;
}

export const substituteHtmlVars = (
    str: string,
    project: IProject,
    desktopBuild: boolean,
    injections: Record<string, string>,
    filenames: Filenames
): string =>
    templateHTML(str, {
        gametitle: project.settings.authoring.title || 'ct.js game',
        accent: project.settings.branding.accent || 'ct.js game',
        particleEmitters: getOfType('tandem').length,
        // includeDragonBones: project.skeletons.some(s => s.from === 'dragonbones'),
        desktopBuild,
        includeDragonBones: false,
        jsbundle: filenames.jsBundle,
        cssbundle: filenames.cssBundle,
        iconrev: filenames.iconRevision,
        ctjsLogo: project.settings.branding.alternativeLogo ? logoPlain : logoMadeWith,
        loadingText: project.settings.branding.customLoadingText || 'Loading…'
    }, injections);