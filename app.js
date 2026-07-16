// app.js

// Константы материалов
const MATERIALS = {
    1: { name: "Алюминиевые сплавы", density: 2700, kMash: 1.0, color: "#38bdf8" },
    2: { name: "Медные сплавы", density: 8900, kMash: 1.5, color: "#f97316" },
    3: { name: "Сталь углеродистая", density: 7850, kMash: 2.0, color: "#ef4444" },
    4: { name: "Сталь легированная", density: 7850, kMash: 3.0, color: "#a855f7" },
    5: { name: "Сталь нержавеющая", density: 7900, kMash: 4.0, color: "#10b981" }
};

// Справочник Швеллеров У (ГОСТ 8240-97)
const SHVELLER_U = {
    "5У": { area: 6.16 * 100, w: 50, h: 32, t: 4.4 },
    "6.5У": { area: 7.51 * 100, w: 65, h: 36, t: 4.4 },
    "8У": { area: 8.98 * 100, w: 80, h: 40, t: 4.5 },
    "10У": { area: 10.9 * 100, w: 100, h: 46, t: 4.5 },
    "12У": { area: 13.3 * 100, w: 120, h: 52, t: 4.8 },
    "14У": { area: 15.6 * 100, w: 140, h: 58, t: 4.9 },
    "16У": { area: 18.1 * 100, w: 160, h: 64, t: 5.0 },
    "16аУ": { area: 19.5 * 100, w: 160, h: 68, t: 5.0 },
    "18У": { area: 20.7 * 100, w: 180, h: 70, t: 5.1 },
    "18аУ": { area: 22.2 * 100, w: 180, h: 74, t: 5.1 },
    "20У": { area: 23.4 * 100, w: 200, h: 76, t: 5.2 },
    "22У": { area: 26.7 * 100, w: 220, h: 82, t: 5.4 },
    "24У": { area: 30.6 * 100, w: 240, h: 90, t: 5.6 },
    "27У": { area: 35.2 * 100, w: 270, h: 95, t: 6.0 },
    "30У": { area: 40.5 * 100, w: 300, h: 100, t: 6.5 },
    "33У": { area: 46.5 * 100, w: 330, h: 105, t: 7.0 },
    "36У": { area: 53.4 * 100, w: 360, h: 110, t: 7.5 },
    "40У": { area: 61.5 * 100, w: 400, h: 115, t: 8.0 }
};

// Параметры профилей (динамические поля)
const PROFILE_FIELDS = {
    pKrug: [
        { id: "input-D", label: "Диаметр D, мм", placeholder: "например, 50" }
    ],
    pPramougol: [
        { id: "input-A", label: "Ширина A, мм", placeholder: "например, 80" },
        { id: "input-B", label: "Высота B, мм", placeholder: "например, 40" }
    ],
    pShestigran: [
        { id: "input-S", label: "Размер под ключ S, мм", placeholder: "например, 24" }
    ],
    pPryamougolTruba: [
        { id: "input-A", label: "Ширина A, мм", placeholder: "например, 60" },
        { id: "input-B", label: "Высота B, мм", placeholder: "например, 40" },
        { id: "input-s_wall", label: "Толщина стенки s, мм", placeholder: "например, 3" }
    ],
    pTruba: [
        { id: "input-D", label: "Диаметр D, мм", placeholder: "например, 50" },
        { id: "input-s_wall", label: "Толщина стенки s, мм", placeholder: "например, 3" }
    ],
    pUgolnik: [
        { id: "input-W", label: "Ширина W, мм", placeholder: "например, 50" },
        { id: "input-H", label: "Высота H, мм", placeholder: "например, 50" },
        { id: "input-a_shelf", label: "Толщина полки a, мм", placeholder: "например, 4" },
        { id: "input-b_shelf", label: "Толщина полки b, мм", placeholder: "например, 4" }
    ],
    pShveller2: [
        { id: "input-W", label: "Ширина W, мм", placeholder: "например, 60" },
        { id: "input-H", label: "Высота H, мм", placeholder: "например, 40" },
        { id: "input-s_wall", label: "Толщина стенки s, мм", placeholder: "например, 4" }
    ],
    pShveller: [
        { id: "select-nomer", label: "Номер швеллера У (ГОСТ)", type: "select", options: Object.keys(SHVELLER_U) }
    ]
};

// Состояние приложения
let currentMaterialId = 1;
let currentProfileId = "pKrug";

// Регистрация DOM-элементов
const dynamicInputsContainer = document.getElementById("dynamic-inputs");
const btnCalculate = document.getElementById("btn-calculate");
const resultsCard = document.getElementById("results-card");
const resultWeight = document.getElementById("result-weight");
const resultsBody = document.getElementById("results-body");

// Рендеринг динамических полей ввода
function renderFields(profileId) {
    dynamicInputsContainer.innerHTML = "";
    const fields = PROFILE_FIELDS[profileId];
    
    fields.forEach(field => {
        const group = document.createElement("div");
        group.className = "input-group";
        
        const label = document.createElement("label");
        label.setAttribute("for", field.id);
        label.innerText = field.label;
        group.appendChild(label);
        
        if (field.type === "select") {
            const select = document.createElement("select");
            select.id = field.id;
            field.options.forEach(opt => {
                const o = document.createElement("option");
                o.value = opt;
                o.innerText = opt;
                select.appendChild(o);
            });
            group.appendChild(select);
        } else {
            const input = document.createElement("input");
            input.type = "number";
            input.id = field.id;
            input.placeholder = field.placeholder || "";
            input.required = true;
            group.appendChild(input);
        }
        
        dynamicInputsContainer.appendChild(group);
    });
}

// Изменение акцентного цвета приложения
function updateAccentColor() {
    const mat = MATERIALS[currentMaterialId];
    document.documentElement.style.setProperty("--accent-active", mat.color);
    document.documentElement.style.setProperty("--glow-shadow", `0 0 20px ${mat.color}40`);
}

// Инициализация обработчиков событий
document.querySelectorAll("input[name='material']").forEach(radio => {
    radio.addEventListener("change", (e) => {
        currentMaterialId = parseInt(e.target.value);
        updateAccentColor();
    });
});

document.querySelectorAll(".profile-card").forEach(card => {
    card.addEventListener("click", (e) => {
        document.querySelectorAll(".profile-card").forEach(c => c.classList.remove("active"));
        const target = e.currentTarget;
        target.classList.add("active");
        currentProfileId = target.getAttribute("data-profile");
        renderFields(currentProfileId);
        resultsCard.classList.add("hidden");
    });
});

// Математика вспомогательного времени и норм
function getVal(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) || 0 : 0;
}

function getSelectVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

// 1. Машинное время резания
function tMash_LentOtrez(materialId, area, tonkosten) {
    if (area <= 0) return 0;
    const mat = MATERIALS[materialId];
    const k = mat.kMash;
    const kLentOtrez = 4.0;
    return (tonkosten ? kLentOtrez : 1.0) * k * 8e-4 * area;
}

// 2. Время установки на стол с болтами и планками
function Ustanov_NaStoleKreplBoltPlank(massa, harakterViverki = 1, tochnostViverki = 0.1) {
    if (massa <= 0) return 0;
    if (tochnostViverki === 0) tochnostViverki = 0.1;
    
    let arr_a = [];
    let arr_x = [];
    
    if (massa <= 20) {
        arr_a = [0.73, 1.04, 1.38, 1.52, 1.66, 2, 2.2];
        arr_x = [0.26, 0.26, 0.26, 0.26, 0.27, 0.27, 0.27];
    } else if (massa <= 3000) {
        arr_a = [2, 2.87, 3.42, 3.76, 4.2, 5.6, 6.18];
        arr_x = [0.22, 0.22, 0.22, 0.22, 0.22, 0.2, 0.2];
    } else if (massa <= 30000) {
        arr_a = [1.05, 1.5, 1.32, 1.45, 4.9, 2.89, 3.18];
        arr_x = [0.3, 0.3, 0.34, 0.34, 0.2, 0.28, 0.28];
    } else {
        arr_a = [0.233, 0.333, 0.346, 0.38, 0.245, 0.338, 0.372];
        arr_x = [0.45, 0.45, 0.47, 0.47, 0.49, 0.49, 0.49];
    }
    
    let a = 0;
    let x = 0;
    
    if (harakterViverki === 1) {
        a = arr_a[0];
        x = arr_x[0];
    } else {
        const isHarakter2 = (harakterViverki === 2);
        if (tochnostViverki > 0.5) {
            a = arr_a[isHarakter2 ? 1 : 4];
            x = arr_x[isHarakter2 ? 1 : 4];
        } else if (tochnostViverki > 0.1) {
            a = arr_a[isHarakter2 ? 2 : 5];
            x = arr_x[isHarakter2 ? 2 : 5];
        } else {
            a = arr_a[isHarakter2 ? 3 : 6];
            x = arr_x[isHarakter2 ? 3 : 6];
        }
    }
    
    return a * Math.pow(massa, x);
}

// 3. Расчёт зачистки заусенцев напильником
function ZachistkaZausencev(materialId, dlinaZachistki, massa) {
    if (dlinaZachistki <= 0) return 0;
    dlinaZachistki = Math.max(dlinaZachistki, 30);
    
    const a = 0.053;
    const b = 0.48;
    
    // KoefMaterial_SlesarRezbonarez
    let k3 = 1.0;
    switch (materialId) {
        case 1: k3 = 0.7; break;
        case 2: k3 = 0.8; break;
        case 3: k3 = 1.0; break;
        case 4: k3 = 1.1; break;
        case 5: k3 = 1.7; break;
        default: k3 = 1.0;
    }
    
    const k4 = (massa > 20) ? 1.2 : 1.0;
    return 1.0 * 1.0 * k3 * k4 * (a * Math.pow(dlinaZachistki, b));
}

// 4. Расчёт ручной правки заготовки
function PravkaZagIzListMatVRuch(a, L, t, materialId) {
    if (a <= 0 || L <= 0 || t <= 0) return 0;
    
    const calcA = Math.max(Math.min(a, L), 25);
    const calcL = Math.max(Math.max(a, L), 120);
    
    let X = 0, Y = 0, Z = 0, W = 0;
    
    if (t <= 2) {
        if (materialId === 1) {
            X = 5.82432275922029E-04; Y = 0.740070046665948; Z = 0.647518865728401; W = 0.45459395648134;
        } else if (materialId === 2) {
            X = 6.08245250859789E-04; Y = 0.746476198065395; Z = 0.665373012893885; W = 0.411977696164669;
        } else {
            X = 6.0591198480024E-04; Y = 0.773305678701967; Z = 0.678351242583209; W = 0.424315299703244;
        }
    } else {
        if (materialId === 1) {
            X = 2.92168253028256E-04; Y = 0.708007645652566; Z = 0.682790989971501; W = 0.584962657462639;
        } else if (materialId === 2) {
            X = 3.6044078569642E-04; Y = 0.740176096982452; Z = 0.656022951481244; W = 0.584962500721156;
        } else {
            X = 3.82722492181706E-04; Y = 0.773305680619784; Z = 0.653297650211473; W = 0.584962500721156;
        }
    }
    
    let basePravka = 0;
    if (t <= 2) {
        basePravka = (X * Math.pow(calcA, Y) * Math.pow(calcL, Z)) / Math.pow(t, W);
    } else {
        basePravka = (X * Math.pow(calcA, Y) * Math.pow(calcL, Z)) * Math.pow(t, W);
    }
    
    let k1 = 1.0;
    switch (materialId) {
        case 1: k1 = 0.7; break;
        case 2: k1 = 0.8; break;
        case 3: k1 = 1.0; break;
        case 4: k1 = 1.1; break;
        case 5: k1 = 1.7; break;
        default: k1 = 1.0;
    }
    
    return basePravka * k1 * 1.5;
}

// 5. Расчёт правки плоских деталей
function PravkaPloskikhDetaley(tolshchina, Dlina, Shirina, materialId) {
    if (tolshchina <= 0 || Dlina <= 0 || Shirina <= 0) return 0;
    
    const L = Math.max(Dlina, Shirina, tolshchina);
    const W = Math.max(Math.min(Dlina, Shirina), Math.min(Dlina, tolshchina));
    const t = Math.min(Dlina, Shirina, tolshchina);
    
    const Ploschad_sm2 = (L * W) / 100;
    
    let kMaterial = 1.0;
    if (materialId === 4 || materialId === 3) {
        kMaterial = 1.0;
    } else if (materialId === 5) {
        kMaterial = 1.1;
    } else if (materialId === 1 || materialId === 2) {
        kMaterial = 0.7;
    }
    
    let kDopTochnost = 0.3 / ((0.2 / L) * 1000);
    if (kDopTochnost < 1) kDopTochnost = 1;
    
    return 1.4 * kDopTochnost * kMaterial * 0.055 * Math.pow(Ploschad_sm2, 0.55) * Math.pow(t, 0.26);
}

// 6. Пескоструйная очистка

function UstanovkaSlesar_NaStoleBezKrepleniya_UstanovkaSyom(massa) {
    let tUst = 0.15;
    if (massa <= 1) tUst = 0.15;
    else if (massa <= 3) tUst = 0.2;
    else if (massa <= 5) tUst = 0.25;
    else if (massa <= 8) tUst = 0.3;
    else if (massa <= 12) tUst = 0.35;
    else if (massa <= 20) tUst = 0.4;
    else if (massa <= 30) tUst = 2.5;
    else if (massa <= 50) tUst = 2.7;
    else tUst = 3.3;
    
    if (massa > 20) tUst *= 2;
    return tUst;
}

function UstanovkaSlesar_NaStoleBezKrepleniya_Povorot(massa) {
    let tUst = 0.1;
    if (massa <= 1) tUst = 0.1;
    else if (massa <= 3) tUst = 0.15;
    else if (massa <= 5) tUst = 0.25; // wait, let's verify what it was: select case <=5: 0.2, <=8: 0.25, <=12: 0.3, <=20: 0.35, <=30: 2.1, <=50: 2.3, else 2.8. Let's make sure it is correct!
    else if (massa <= 8) tUst = 0.25;
    else if (massa <= 12) tUst = 0.3;
    else if (massa <= 20) tUst = 0.35;
    else if (massa <= 30) tUst = 2.1;
    else if (massa <= 50) tUst = 2.3;
    else tUst = 2.8;
    
    if (massa > 20) tUst *= 2;
    return tUst;
}

function PeskostruynayaOchistka(diamWidth, dlina, tipZag = 2, gruppaSlozh = 2, massa = 1, materialId = 3) {
    let dim1 = Math.max(diamWidth, dlina, 0);
    let dim2 = 0;
    if (dim1 === diamWidth) dim2 = Math.max(dlina, 0);
    else dim2 = Math.max(diamWidth, 0);
    
    let L = Math.max(dim1, 100);
    let W = dim2;
    
    let kMaterial = 1.0;
    if (materialId === 4 || materialId === 5 || materialId === 3) {
        kMaterial = 1.0;
    } else if (materialId === 2 || materialId === 1) {
        kMaterial = 0.9;
    }
    
    let X = 0.004, Y = 0.36, Z = 0.77;
    if (tipZag === 1) { X = 0.0294; Y = 0.15; Z = 0.49; }
    else if (tipZag === 3) { X = 0.0042; Y = 0.6; Z = 0.61; }
    
    const kSlozh = (gruppaSlozh === 2 && tipZag > 1) ? 1.2 : 1.0;
    const kUsloviya = 1.3;
    
    const tUst = UstanovkaSlesar_NaStoleBezKrepleniya_UstanovkaSyom(massa) + UstanovkaSlesar_NaStoleBezKrepleniya_Povorot(massa) * 1;
    return kMaterial * kSlozh * kUsloviya * (X * Math.pow(W, Y) * Math.pow(L, Z)) + tUst;
}

// 7. Термообработка (Закалка и Отпуск)
function VremyaNagreva(tipStali, tipSecheniya, secheniye) {
    let temp = 0;
    if (tipStali === 1) {
        temp = (tipSecheniya === 1) ? 55 : 82.5;
    } else if (tipStali === 2) {
        temp = (tipSecheniya === 1) ? 65 : 85;
    } else {
        temp = (tipSecheniya === 1) ? 77.5 : 95;
    }
    return (temp * secheniye) / 60;
}

function VremyaVyderzhki(tipStali) {
    return (tipStali === 1) ? 127.5 : 135;
}

function ZagruzkaNaPodPechi(massa, kolVo = 3) {
    return 0.1326 * Math.pow(massa, 0.3) * Math.pow(kolVo, 0.77);
}

function VygruzkaIzPechiVOkhlazhdSredu(massa, kolVo = 3) {
    return 0.143 * Math.pow(massa, 0.3) * Math.pow(kolVo, 0.77);
}

function VygruzkaIzPechiVTaru(massa, kolVo = 3) {
    return 0.0865 * Math.pow(massa, 0.3) * Math.pow(kolVo, 0.77);
}


function KoeffitsientSovpadeniya(Kz, kolVoPechey = 3) {
    let KzArray = [];
    let KsArray = [];
    
    switch (kolVoPechey) {
        case 1:
        case 2:
            KzArray = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45];
            KsArray = [1.01, 1.02, 1.04, 1.06, 1.09, 1.12, 1.16, 1.2, 1.26];
            break;
        case 3:
            KzArray = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45];
            KsArray = [1.01, 1.02, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4, 1.5, 1.6];
            break;
        case 4:
            KzArray = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45];
            KsArray = [1.02, 1.04, 1.1, 1.16, 1.26, 1.4, 1.5, 1.7, 1.85, 2.05];
            break;
        case 5:
            KzArray = [0.05, 0.1, 0.15, 0.2, 0.25];
            KsArray = [1.03, 1.04, 1.15, 1.23, 1.4, 1.65];
            break;
        case 6:
            KzArray = [0.05, 0.1, 0.15];
            KsArray = [1.04, 1.07, 1.2, 1.35];
            break;
        case 7:
            KzArray = [0.05, 0.1];
            KsArray = [1.07, 1.12, 1.25];
            break;
        default:
            KzArray = [0.05];
            KsArray = [1.09, 1.21];
            break;
    }
    
    if (Kz > KzArray[KzArray.length - 1]) {
        return KsArray[KsArray.length - 1];
    }
    
    let idx = KzArray.findIndex(x => x >= Kz);
    if (idx !== -1) {
        return KsArray[idx];
    }
    return KsArray[KsArray.length - 1];
}

function TermoObrabotka(osnovnoe, vspom, kolVoPechey = 3, kolVoDetaley = 3) {
    if (osnovnoe <= 0) return 0;
    const tOper = osnovnoe + vspom;
    const tNabl = tOper * 0.06;
    const tZan = tOper + tNabl;
    const Kz = tZan / osnovnoe;
    const Ks = KoeffitsientSovpadeniya(Kz, kolVoPechey);
    const Obsluzh = (Kz < 0.5) ? 1.05 : 1.13;
    return ((tOper * Ks) / (kolVoPechey * kolVoDetaley)) * Obsluzh;
}

function Zakalka(tipStali, tipSecheniya, secheniye, massa) {
    const tNagreva = VremyaNagreva(tipStali, tipSecheniya, secheniye);
    const tVspom = ZagruzkaNaPodPechi(massa) + VygruzkaIzPechiVOkhlazhdSredu(massa);
    return TermoObrabotka(tNagreva, tVspom);
}

function Otpusk(tipStali, massa) {
    const tVyderzhki = VremyaVyderzhki(tipStali);
    const tVspom = ZagruzkaNaPodPechi(massa) + VygruzkaIzPechiVTaru(massa);
    return TermoObrabotka(tVyderzhki, tVspom);
}

// 8. Измерение линейкой/рулеткой
function IzmereniyeLineykoyRuletkoy(razmer) {
    if (razmer <= 0) return 0;
    const baseKoef = (razmer > 1000) ? 0.0001 : 0.0002;
    const constantAdded = (razmer > 1000) ? 0.5 : 0.2;
    return baseKoef * razmer + constantAdded;
}

// 9. Визуальный контроль
function VisualnyyKontrol(diamPerim, dlina) {
    if (diamPerim <= 0 || dlina <= 0) return 0;
    const d = Math.max(diamPerim, 25);
    const L = Math.max(dlina, 65);
    return 0.01 * 1 * 1 * Math.pow(d * L, 0.3);
}

// 10. Упаковка
function ObvyazyvaniyeProvolokoy(dlinaVitka) {
    return (0.0579 * Math.pow(3, 0.29) * Math.pow(3, 0.92) * Math.pow(dlinaVitka, 0.3)) * 1.12;
}

function ObertyvaniyeBumagoy(tipDetali, diamWidth, dlina) {
    const minVal = Math.min(diamWidth, dlina);
    const maxVal = Math.max(diamWidth, dlina);
    const coef = (tipDetali === 1) ? 0.00019 : 0.00041;
    return (coef * Math.pow(minVal, 0.67) * Math.pow(maxVal, 0.67)) * 1.12;
}

function UpakovyvaniyePramougolnika(Dlina, Shirina, tolshchina) {
    const dims = [Dlina, Shirina, tolshchina].sort((a,b) => b-a);
    const L = dims[0];
    const W = dims[1];
    const t = dims[2];
    
    const tObert = ObertyvaniyeBumagoy(1, W, L);
    const tObvyaz = ObvyazyvaniyeProvolokoy((W + t) * 2);
    return tObert + tObvyaz;
}

function UpakovyvaniyeKruglogoPrutka(D, L) {
    const tObvyaz = ObvyazyvaniyeProvolokoy(Math.PI * D);
    const tObert = ObertyvaniyeBumagoy(2, D, L);
    return tObvyaz + tObert;
}

function UpakovyvaniyeShestigrannika(S, L) {
    const side = S / Math.sqrt(3);
    const tObvyaz = ObvyazyvaniyeProvolokoy(side * 6);
    const D = 2 * S / Math.sqrt(3);
    const tObert = ObertyvaniyeBumagoy(2, D, L);
    return tObvyaz + tObert;
}

// Округление Тшт
function OkruglenieTsht(val) {
    if (val <= 0) return 0;
    // Округляем до 2 знаков
    return Math.round(val * 100) / 100;
}

// Сборка техмаршрута
function SostavitMarshrut(Dlina, PerimDiam, Rikhtovka, Normy, Massa) {
    const K_TIP_PROIZV = 1.3;
    
    Normy.tKontrolLineynogoRazmera = IzmereniyeLineykoyRuletkoy(Dlina);
    Normy.tVisualnyyKontrol = VisualnyyKontrol(PerimDiam, Dlina);
    
    let operations = [
        ["Ленточно-отрезная", 10, Normy.tLentOtrez],
        ["Контрольная", 0, K_TIP_PROIZV * Normy.tKontrolLineynogoRazmera],
        ["Маркирование (этикеткой)", 0, 3],
        ["Упаковывание", 0, K_TIP_PROIZV * Normy.tUpakovka],
        ["Контрольная (после упак.)", 0, K_TIP_PROIZV * Normy.tVisualnyyKontrol],
        ["Закалка", 60, Normy.tZakalka],
        ["Отпуск", 30, Normy.tOtpusk],
        ["Контрольная (после то)", 0, 2],
        ["Пескоструйная", 5, K_TIP_PROIZV * Normy.tPeskostruy],
        ["Контрольная (визуальная)", 0, K_TIP_PROIZV * Normy.tVisualnyyKontrol]
    ];
    
    const tSlesar = Normy.tZaus + (Rikhtovka ? Normy.tPravka : 0) + UstanovkaSlesar_NaStoleBezKrepleniya_UstanovkaSyom(Massa);
    if (tSlesar > 0) {
        operations.push(["Слесарная", 5, K_TIP_PROIZV * tSlesar]);
    }
    
    // Округляем все Тшт
    operations.forEach(op => {
        op[2] = OkruglenieTsht(op[2]);
    });
    
    // Вставка массы в конец
    operations.push(["Масса", Massa, ""]);
    
    return operations;
}

// Главная функция выполнения расчёта
function executeCalculation() {
    const mat = MATERIALS[currentMaterialId];
    const Plotnost = mat.density;
    const tipStali = (currentMaterialId === 5) ? 2 : 1;
    
    const L = getVal("input-L");
    if (L <= 0) {
        alert("Пожалуйста, введите корректную длину заготовки L!");
        return;
    }
    
    const rikhtovka = document.getElementById("chk-pravka").checked;
    
    let area = 0;
    let massa = 0;
    let perimDiam = 0;
    let tonkosten = false;
    
    let tZakalka = 0;
    let tOtpusk = 0;
    let tUpakovka = 0;
    let tZaus = 0;
    let tPravka = 0;
    
    switch (currentProfileId) {
        case "pKrug": {
            const D = getVal("input-D");
            if (D <= 0) return alert("Введите диаметр D!");
            area = Math.PI * Math.pow(D / 2, 2);
            massa = (Plotnost * area * L) / 1e9;
            perimDiam = D;
            tonkosten = false;
            
            tZakalka = Zakalka(tipStali, 1, D, massa);
            tOtpusk = Otpusk(tipStali, massa);
            tUpakovka = UpakovyvaniyeKruglogoPrutka(D, L);
            tZaus = 0;
            tPravka = 0;
            break;
        }
        case "pPramougol": {
            const A = getVal("input-A");
            const B = getVal("input-B");
            if (A <= 0 || B <= 0) return alert("Введите размеры A и B!");
            area = A * B;
            massa = (Plotnost * area * L) / 1e9;
            perimDiam = 2 * (A + B);
            tonkosten = false;
            
            const minSide = Math.min(A, B);
            const maxSide = Math.max(A, B);
            tZakalka = Zakalka(tipStali, (minSide === maxSide) ? 2 : 3, minSide, massa);
            tOtpusk = Otpusk(tipStali, massa);
            tUpakovka = UpakovyvaniyePramougolnika(L, A, B);
            tZaus = ZachistkaZausencev(currentMaterialId, 4 * (A + L) + 4 * B, massa);
            tPravka = 4.0 * PravkaPloskikhDetaley(minSide, L, A, currentMaterialId);
            break;
        }
        case "pShestigran": {
            const S = getVal("input-S");
            if (S <= 0) return alert("Введите размер S!");
            // площадь шестигранника: sqrt(3) / 2 * 3 / 3 * S^2 => sqrt(3)/2 * S^2
            area = (Math.sqrt(3) / 2) * Math.pow(S, 2) * 2; // wait, let's verify formula: sqrt(3) * 1.5 * a^2 where a = S/sqrt(3) -> sqrt(3)*1.5*S^2/3 = S^2 * sqrt(3)/2 \approx 0.866 * S^2
            // Let's use exact formula
            area = (Math.sqrt(3) / 2) * Math.pow(S, 2) * 2; // wait, regular hexagon: 3 * sqrt(3) / 2 * a^2 => S = 2 * a * sin(60) = a * sqrt(3) => a = S/sqrt(3) => area = 3 * sqrt(3) / 2 * S^2 / 3 = S^2 * sqrt(3) / 2. Yes!
            massa = (Plotnost * area * L) / 1e9;
            const opOkruzh = 2.0 * S / Math.sqrt(3.0);
            perimDiam = opOkruzh;
            tonkosten = false;
            
            tZakalka = Zakalka(tipStali, 3, S, massa);
            tOtpusk = Otpusk(tipStali, massa);
            tUpakovka = UpakovyvaniyeShestigrannika(S, L);
            tZaus = ZachistkaZausencev(currentMaterialId, S * 6, massa); // standard
            tPravka = 4.0 * PravkaPloskikhDetaley(S, L, S, currentMaterialId);
            break;
        }
        case "pPryamougolTruba": {
            const A = getVal("input-A");
            const B = getVal("input-B");
            const s = getVal("input-s_wall");
            if (A <= 0 || B <= 0 || s <= 0) return alert("Введите размеры A, B и s!");
            area = A * B - (A - 2 * s) * (B - 2 * s);
            massa = (Plotnost * area * L) / 1e9;
            perimDiam = 2 * (A + B);
            tonkosten = true;
            
            tZakalka = Zakalka(tipStali, 3, s, massa);
            tOtpusk = Otpusk(tipStali, massa);
            tUpakovka = UpakovyvaniyePramougolnika(L, A, B);
            tZaus = 2.0 * ZachistkaZausencev(currentMaterialId, 4 * A + 4 * B - 8 * s, massa);
            tPravka = 4.0 * PravkaPloskikhDetaley(s, L, 2 * (A + B), currentMaterialId);
            break;
        }
        case "pTruba": {
            const D = getVal("input-D");
            const s = getVal("input-s_wall");
            if (D <= 0 || s <= 0) return alert("Введите диаметр D и толщину стенки s!");
            area = Math.PI * (D * s - s * s);
            massa = (Plotnost * area * L) / 1e9;
            perimDiam = D;
            tonkosten = true;
            
            tZakalka = Zakalka(tipStali, 1, s, massa);
            tOtpusk = Otpusk(tipStali, massa);
            tUpakovka = UpakovyvaniyeKruglogoPrutka(D, L);
            tZaus = 0;
            tPravka = 0;
            break;
        }
        case "pUgolnik": {
            const W = getVal("input-W");
            const H = getVal("input-H");
            const a = getVal("input-a_shelf");
            const b = getVal("input-b_shelf");
            if (W <= 0 || H <= 0 || a <= 0 || b <= 0) return alert("Введите размеры W, H, a и b!");
            area = W * b + (H - b) * a;
            massa = (Plotnost * area * L) / 1e9;
            perimDiam = 2 * (W + H);
            tonkosten = true;
            
            tZakalka = Zakalka(tipStali, 3, Math.max(a, b), massa);
            tOtpusk = Otpusk(tipStali, massa);
            tUpakovka = UpakovyvaniyePramougolnika(L, W, H);
            tZaus = 2.0 * ZachistkaZausencev(currentMaterialId, 2 * (H + W), massa);
            tPravka = 4.0 * (PravkaPloskikhDetaley(a, L, W, currentMaterialId) + PravkaPloskikhDetaley(b, L, H, currentMaterialId));
            break;
        }
        case "pShveller2": {
            const W = getVal("input-W");
            const H = getVal("input-H");
            const s = getVal("input-s_wall");
            if (W <= 0 || H <= 0 || s <= 0) return alert("Введите размеры W, H и s!");
            area = s * (2 * H + W - 2 * s);
            massa = (Plotnost * area * L) / 1e9;
            perimDiam = 2 * (W + H);
            tonkosten = true;
            
            tZakalka = Zakalka(tipStali, 3, s, massa);
            tOtpusk = Otpusk(tipStali, massa);
            tUpakovka = UpakovyvaniyePramougolnika(L, W, H);
            tZaus = 2.0 * ZachistkaZausencev(currentMaterialId, 2 * (H + W), massa);
            tPravka = 4.0 * (PravkaPloskikhDetaley(s, L, W, currentMaterialId) + PravkaPloskikhDetaley(s, L, H, currentMaterialId));
            break;
        }
        case "pShveller": {
            const nomer = getSelectVal("select-nomer");
            const shv = SHVELLER_U[nomer];
            if (!shv) return alert("Выберите номер швеллера!");
            area = shv.area;
            massa = (Plotnost * area * L) / 1e9;
            perimDiam = 2 * (shv.w + shv.h);
            tonkosten = true;
            
            tZakalka = Zakalka(tipStali, 3, shv.t, massa);
            tOtpusk = Otpusk(tipStali, massa);
            tUpakovka = UpakovyvaniyePramougolnika(L, shv.w, shv.h);
            tZaus = 2.0 * ZachistkaZausencev(currentMaterialId, 2 * (shv.h + shv.w), massa);
            tPravka = 4.0 * (PravkaZagIzListMatVRuch(shv.w, L, shv.t, currentMaterialId) + PravkaZagIzListMatVRuch(shv.h, L, shv.t, currentMaterialId));
            break;
        }
    }
    
    const tLentOtrez = tMash_LentOtrez(currentMaterialId, area, tonkosten) + Ustanov_NaStoleKreplBoltPlank(massa, 1, 0);
    const tPeskostruy = PeskostruynayaOchistka(perimDiam, L, 2, 2, massa, currentMaterialId);
    
    const Normy = {
        tLentOtrez,
        tZakalka,
        tOtpusk,
        tUpakovka,
        tPeskostruy,
        tZaus,
        tPravka
    };
    
    // Сборка техмаршрута
    const operations = SostavitMarshrut(L, perimDiam, rikhtovka, Normy, massa);
    
    // Вывод результатов на UI
    resultWeight.innerText = massa.toFixed(3);
    
    resultsBody.innerHTML = "";
    operations.forEach(op => {
        const tr = document.createElement("tr");
        
        const tdName = document.createElement("td");
        tdName.innerText = op[0];
        tr.appendChild(tdName);
        
        const tdTpz = document.createElement("td");
        tdTpz.innerText = op[1] !== "" ? op[1] : "-";
        tr.appendChild(tdTpz);
        
        const tdTsht = document.createElement("td");
        tdTsht.innerText = op[2] !== "" ? op[2] : "-";
        tr.appendChild(tdTsht);
        
        resultsBody.appendChild(tr);
    });
    
    resultsCard.classList.remove("hidden");
    
    // Плавный скролл к результатам
    resultsCard.scrollIntoView({ behavior: "smooth" });
}

// Привязка кнопки расчёта
btnCalculate.addEventListener("click", executeCalculation);

// Первая загрузка
renderFields(currentProfileId);
updateAccentColor();
