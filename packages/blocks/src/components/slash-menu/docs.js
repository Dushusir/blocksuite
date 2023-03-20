export function univerContainer(demo, { toolbar = false, width = '100%', height = '360px', isFullscreen = true } = {}) {

    let isPasteSheet = (demo.indexOf('<table') > -1 && demo.indexOf('<td') > -1);

    const div = document.createElement('div');
    const univerid = makeid(6)

    div.id = "univer-demo";
    div.setAttribute("data-univerid", univerid)
    div.classList.add("univer-demo");
    div.style.width = width;
    div.style.height = height;

    let config = {
        toolbar,
        refs: div,
        isPasteSheet
    }

    if (!isFullscreen) {
        config.innerLeft = true
    }

    initUniverNew(demo, config)
    stopImmediatePropagation(div)


    if (isFullscreen) {
        div.insertAdjacentHTML('afterbegin', '<span class="btn-fullscreen"><svg t="1678777083701" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M339.432 63.594H99.944c-19.851 0-36 16.149-36 36v239.488c0 17.673 14.327 32 32 32s32-14.327 32-32V127.594h211.487c17.673 0 32-14.327 32-32 0.001-17.673-14.326-32-31.999-32zM339.432 895.503H127.944V684.016c0-17.673-14.327-32-32-32s-32 14.327-32 32v239.487c0 19.851 16.149 36 36 36h239.487c17.673 0 32-14.327 32-32s-14.326-32-31.999-32zM928 651.915c-17.673 0-32 14.327-32 32v211.487H684.513c-17.673 0-32 14.327-32 32s14.327 32 32 32H924c19.851 0 36-16.149 36-36V683.915c0-17.673-14.327-32-32-32zM924 64.151H684.513c-17.673 0-32 14.327-32 32s14.327 32 32 32H896v211.488c0 17.673 14.327 32 32 32s32-14.327 32-32V100.151c0-19.851-16.149-36-36-36z" fill=""></path></svg></span>');
        const btnFullscreen = div.querySelector('.btn-fullscreen');
        btnFullscreen.addEventListener('click', () => {
            // eslint-disable-next-line no-undef
            const dialog = document.querySelector("#dialog");
            const dialogBody = dialog.querySelector(".dialog-body");
            dialogBody.innerHTML = '';
            if (demo === 'sheet' || isPasteSheet) {
                setFullscreenContainer(div, btnFullscreen)
            } else {
                dialogBody.appendChild(univerContainer(demo, { toolbar: true, height: 'calc(100vh - 170px)', isFullscreen: false }))

            }
            dialog.style.display = "block";



        })
    }


    return div
}

function setFullscreenContainer(container, btnFullscreen) {
    container.style.width = window.innerWidth - 200 + 'px'
    container.style.height = window.innerHeight - 200 + 'px'
    container.style.position = 'fixed'
    container.style.left = '100px'
    container.style.top = '100px'
    container.classList.add('activeUniver')

    container.style.zIndex = 10000
    var myEvent = new Event('resize'); window.dispatchEvent(myEvent)
    btnFullscreen.style.display = 'none'
}



export function addUniver(vEditor, text) {
    setTimeout(() => {
        vEditor._rootElement?.parentNode.insertBefore(univerContainer(text), vEditor._rootElement);

    }, 0);
}



export function initUniverNew(content, setting) {

    const { isPasteSheet } = setting
    if (isPasteSheet) {
        return initSheetNew(content, setting)
    }
    switch (content) {
        case 'sheet':
            initSheetNew(content, setting)
            break;
        case 'doc':
            initDocNew(setting)
            break;
        case 'slide':
            initSlideNew(setting)
            break;
        case 'DEMO1':
        case 'DEMO2':
        case 'DEMO3':
        case 'DEMO4':
        case 'DEMO5':
        case 'DEMO6':
            initSheetByDemoNew(content, setting)
            break;

        default:
            break;
    }
}

export function initSheetNew(tableHTML, setting) {
    const { toolbar, refs, isPasteSheet } = setting
    let cellData = {}
    let mergeData = {}
    let rowData = []
    let columnData = []

    if (isPasteSheet) {
        const { BaseComponent } = UniverPreactTs
        const { handelTableToJson, handleTableColgroup, handleTableRowGroup, handleTableMergeData } = BaseComponent
        const data = handelTableToJson(tableHTML)
        const colInfo = handleTableColgroup(tableHTML);
        columnData = colInfo.map(w => {
            return { w }
        })
        const rowInfo = handleTableRowGroup(tableHTML);
        rowData = rowInfo.map(h => {
            return { h }
        })

        const tableData = handleTableMergeData(data);
        mergeData = tableData.mergeData;

        data.forEach((row, i) => {
            cellData[i] = {}
            row.forEach((column, j) => {
                cellData[i][j] = column
            })
        })
    } else {
        cellData = {
            '0': {
                '0': {
                    m: '',
                    v: ''
                }
            }
        }
    }


    const { univerSheetCustom, CommonPluginData } = UniverPreactTs
    const { DEFAULT_WORKBOOK_DATA } = CommonPluginData
    const uiSheetsConfig = {
        container: refs,
        layout: {
            sheetContainerConfig: {
                infoBar: false,
                formulaBar: false,
                toolbar,
                sheetBar: false,
                countBar: false,
                rightMenu: false
            }
        },
    }

    const baseSheetsConfig = {
        selections: {
            'sheet-01': [
                {
                    selection: {
                        startRow: 0,
                        endRow: 1,
                        startColumn: 0,
                        endColumn: 1
                    },
                    cell: {
                        row: 0,
                        column: 0
                    }
                }
            ]
        }
    }

    let columnCount = 13
    if (window.innerWidth < 1366) {
        columnCount = 7
    }
    const config = {
        id: makeid(6),
        styles: null,
        namedRanges: null,
        sheetOrder: [],
        sheets: {
            'sheet-01': {
                type: 0,
                id: 'sheet-01',
                name: 'sheet1',
                // columnCount,
                status: 1,
                cellData,
            }
        }
    }
    if(isPasteSheet){
        config.sheets['sheet-01'].mergeData = mergeData;
        config.sheets['sheet-01'].rowData = rowData;
        config.sheets['sheet-01'].columnData = columnData;
    }
    const coreConfig = Object.assign({}, DEFAULT_WORKBOOK_DATA, config)

    univerSheetCustom({
        coreConfig,
        uiSheetsConfig,
        baseSheetsConfig
    })
}
export function initSheetByDemoNew(demo, setting) {
    const { toolbar, refs } = setting
    const { univerSheetCustom, CommonPluginData, UniverCore } = UniverPreactTs
    const {
        DEFAULT_WORKBOOK_DATA_DEMO1,
        DEFAULT_WORKBOOK_DATA_DEMO2,
        DEFAULT_WORKBOOK_DATA_DEMO3,
        DEFAULT_WORKBOOK_DATA_DEMO4,
        DEFAULT_WORKBOOK_DATA_DEMO5,
        DEFAULT_WORKBOOK_DATA_DEMO6
    } = CommonPluginData

    const demoInfo = {
        DEMO1: DEFAULT_WORKBOOK_DATA_DEMO1,
        DEMO2: DEFAULT_WORKBOOK_DATA_DEMO2,
        DEMO3: DEFAULT_WORKBOOK_DATA_DEMO3,
        DEMO4: DEFAULT_WORKBOOK_DATA_DEMO4,
        DEMO5: DEFAULT_WORKBOOK_DATA_DEMO5,
        DEMO6: DEFAULT_WORKBOOK_DATA_DEMO6
    }
    const uiSheetsConfig = {
        container: refs,
        layout: {
            sheetContainerConfig: {
                infoBar: false,
                formulaBar: false,
                toolbar,
                sheetBar: false,
                countBar: false,
                rightMenu: false
            }
        }
    }
    const baseSheetsConfig = {
        selections: {
            'sheet-01': [
                {
                    selection: {
                        startRow: 11,
                        endRow: 11,
                        startColumn: 1,
                        endColumn: 1
                    },
                    cell: {
                        row: 11,
                        column: 1
                    }
                }
            ]
        }
    }

    const coreConfig = UniverCore.Tools.deepClone(demoInfo[demo])

    coreConfig.id = makeid(6)
    coreConfig.sheetOrder = []
    univerSheetCustom({
        coreConfig,
        uiSheetsConfig,
        baseSheetsConfig
    })
}
export function initDocNew(setting) {
    const { toolbar, refs } = setting
    const { univerDocCustom, UniverCore, CommonPluginData } = UniverPreactTs

    const { DEFAULT_DOCUMENT_DATA_EN } = CommonPluginData

    const coreConfig = UniverCore.Tools.deepClone(DEFAULT_DOCUMENT_DATA_EN)
    coreConfig.id = makeid(6)
    coreConfig.pageSize = {
        width: 400,
        height: 225,
    }

    const uiDocsConfig = {
        container: refs,
        layout: {
            docContainerConfig: {
                innerRight: false,
                outerLeft: false,
                infoBar: false,
                toolbar
            }
        },
    }
    const univerdoc = univerDocCustom({
        coreConfig,
        uiDocsConfig
    })

    setTimeout(() => {
        univerdoc._context.getPluginManager().getRequirePluginByName('document').calculatePagePosition();
    }, 0);

}
export function initSlideNew(setting) {
    const { toolbar, refs, innerLeft = false } = setting
    const { univerSlideCustom, UniverCore, CommonPluginData } = UniverPreactTs
    const { DEFAULT_SLIDE_DATA } = CommonPluginData

    const coreConfig = UniverCore.Tools.deepClone(DEFAULT_SLIDE_DATA)
    coreConfig.id = makeid(6)

    const uiSlidesConfig = {
        container: refs,
        layout: {
            slideContainerConfig: {
                innerLeft,
                innerRight: false,
                outerLeft: false,
                infoBar: false,
                toolbar
            }
        },
    }
    const universlide = univerSlideCustom({
        coreConfig,
        uiSlidesConfig
    })
    setTimeout(() => {
        universlide._context.getPluginManager().getPluginByName('slide').getCanvasView().scrollToCenter()
    }, 0);
}


export function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function stopImmediatePropagation(container) {
    container && container.addEventListener('wheel', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('click', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('drag', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('mousedown', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('mousemove', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('keydown', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('keyup', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('cut', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('copy', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('paste', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('compositionstart', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('compositionupdate', (e) => {
        e.stopImmediatePropagation()
    });
    container && container.addEventListener('compositionend', (e) => {
        e.stopImmediatePropagation()
    });
}