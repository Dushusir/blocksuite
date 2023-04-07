import { createPopper } from '@popperjs/core';

const ipAddress = '47.100.177.253:8500';
export const urlCollbaration = 'http://luckysheet.lashuju.com/univer/';
const univer_config = { type: 'sheet', template: 'DEMO1' };

export function univerContainer(
  demo,
  {
    toolbar = false,
    width = '100%',
    height = '360px',
    isFullscreen = true,
    isCopy = true,
  } = {}
) {
  let isPasteSheet = demo.indexOf('<table') > -1 && demo.indexOf('<td') > -1;

  const div = document.createElement('div');
  const univerid = makeid(6);

  div.id = 'univer-demo';
  div.setAttribute('data-univerid', univerid);
  div.classList.add('univer-demo');
  div.style.width = width;
  div.style.height = height;

  let universheet = null;
  let univerId = null;
  let config = {
    toolbar,
    refs: div,
    isPasteSheet,
    success: universheet => {
      universheet = universheet;

      univerId = universheet
        .getWorkBook()
        .getContext()
        .getUniver()
        .getGlobalContext()
        .getUniverId();
    },
  };

  if (!isFullscreen) {
    config.innerLeft = true;
  }

  initUniverNew(demo, config);
  stopImmediatePropagation(div);

  if (isFullscreen) {
    div.insertAdjacentHTML(
      'afterbegin',
      '<span class="btn-fullscreen"><svg t="1678777083701" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M339.432 63.594H99.944c-19.851 0-36 16.149-36 36v239.488c0 17.673 14.327 32 32 32s32-14.327 32-32V127.594h211.487c17.673 0 32-14.327 32-32 0.001-17.673-14.326-32-31.999-32zM339.432 895.503H127.944V684.016c0-17.673-14.327-32-32-32s-32 14.327-32 32v239.487c0 19.851 16.149 36 36 36h239.487c17.673 0 32-14.327 32-32s-14.326-32-31.999-32zM928 651.915c-17.673 0-32 14.327-32 32v211.487H684.513c-17.673 0-32 14.327-32 32s14.327 32 32 32H924c19.851 0 36-16.149 36-36V683.915c0-17.673-14.327-32-32-32zM924 64.151H684.513c-17.673 0-32 14.327-32 32s14.327 32 32 32H896v211.488c0 17.673 14.327 32 32 32s32-14.327 32-32V100.151c0-19.851-16.149-36-36-36z" fill=""></path></svg></span>'
    );
    const btnFullscreen = div.querySelector('.btn-fullscreen');
    // const btnUniverCopy = div.querySelector('.btn-univer-copy');
    btnFullscreen.addEventListener('click', () => {
      // eslint-disable-next-line no-undef
      const dialog = document.querySelector('#dialog');
      const dialogBody = dialog.querySelector('.dialog-body');
      dialogBody.innerHTML = '';
      // if (demo === 'sheet' || isPasteSheet) {
      setFullscreenContainer(div, btnFullscreen);
      // } else {
      //     dialogBody.appendChild(univerContainer(demo, { toolbar: true, height: 'calc(100vh - 170px)', isFullscreen: false }))

      // }
      dialog.style.display = 'block';
    });

    // btnUniverCopy.addEventListener('click', () => {
    //     const url = urlCollbaration + '?id=' + univerId;
    //     copyTextToClipboard(url);
    //     alert('copy url success:  ' + url)
    // })
  }

  if (isCopy) {
    div.insertAdjacentHTML(
      'afterbegin',
      '<span class="btn-copy"><svg t="1680510641600" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2758" width="20" height="20"><path d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z" fill="#5E6570" p-id="2759"></path><path d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z" fill="#5E6570" p-id="2760"></path><path d="M544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320z" fill="#5E6570" p-id="2761"></path><path d="M608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480z" fill="#5E6570" p-id="2762"></path><path d="M608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z" fill="#5E6570" p-id="2763"></path></svg></span><span class="prompt">复制成功</span>'
    );
    const btnCopy = div.querySelector('.btn-copy');
    btnCopy.addEventListener('click', () => {
      if (document.execCommand) {
        const url = urlCollbaration + '?id=' + univerId;
        const textarea = document.createElement('textarea');
        textarea.setAttribute('readonly', 'readonly');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.blur();
        const prompt = document.querySelector('.prompt')
        prompt.style.display = 'block'
        setTimeout(() => {
          prompt.style.display = 'none'
        }, 1000)
      }
    });
  }

  return div;
}

function setFullscreenContainer(container, btnFullscreen) {
  container.style.width = window.innerWidth - 200 + 'px';
  container.style.height = window.innerHeight - 200 + 'px';
  container.style.position = 'fixed';
  container.style.left = '100px';
  container.style.top = '100px';
  container.classList.add('activeUniver');

  container.style.zIndex = 10000;
  var myEvent = new Event('resize');
  window.dispatchEvent(myEvent);
  btnFullscreen.style.display = 'none';
}

export function addUniver(_rootElement, text) {
  setTimeout(() => {
    _rootElement?.parentNode.insertBefore(univerContainer(text), _rootElement);
  }, 0);
}

export function initUniverNew(content, setting) {

  refresh()
  const { isPasteSheet } = setting;
  if (isPasteSheet) {
    return initSheetNew(content, setting);
  }
  // handle http://luckysheet.lashuju.com/univer/?id=nxt0kDHPz3
  else if (content.indexOf('luckysheet.lashuju.com/univer/?id=') !== -1) {
    const univerId = content.split('?id=')[1];
    setting.univerId = univerId;
    return initSheetByDemoNew(content, setting);
  }
  switch (content) {
    case 'sheet':
      return initSheetNew(content, setting);
    case 'doc':
      initDocNew(setting);
      break;
    case 'slide':
      initSlideNew(setting);
      break;
    case 'DEMO1':
    case 'DEMO2':
    case 'DEMO3':
    case 'DEMO4':
    case 'DEMO5':
    case 'DEMO6':
      initSheetByDemoNew(content, setting);
      break;

    default:
      break;
  }
}

export function initSheetNew(tableHTML, setting) {
  const { toolbar, refs, isPasteSheet, success: cb } = setting;
  let cellData = {};
  let mergeData = {};
  let rowData = [];
  let columnData = [];

  if (isPasteSheet) {
    const { BaseComponent } = UniverPreactTs;
    const {
      handelTableToJson,
      handleTableColgroup,
      handleTableRowGroup,
      handleTableMergeData,
      handelExcelToJson,
      handlePlainToJson,
    } = BaseComponent;

    // const data = handelTableToJson(tableHTML)
    // const colInfo = handleTableColgroup(tableHTML);
    // const rowInfo = handleTableRowGroup(tableHTML);

    let data;
    let colInfo;
    let rowInfo;
    if (tableHTML) {
      if (
        tableHTML.indexOf('xmlns:x="urn:schemas-microsoft-com:office:excel"') >
        -1
      ) {
        data = handelExcelToJson(tableHTML);
        colInfo = handleTableColgroup(tableHTML);
        rowInfo = handleTableRowGroup(tableHTML);
      } else if (
        tableHTML.indexOf('<table') > -1 &&
        tableHTML.indexOf('<td') > -1
      ) {
        data = handelTableToJson(tableHTML);
        colInfo = handleTableColgroup(tableHTML);
        rowInfo = handleTableRowGroup(tableHTML);
      } else {
        data = handlePlainToJson(tableHTML);
      }
    }

    columnData = colInfo.map(w => {
      return { w };
    });

    rowData = rowInfo.map(h => {
      return { h };
    });

    const tableData = handleTableMergeData(data);
    mergeData = tableData.mergeData;

    data.forEach((row, i) => {
      cellData[i] = {};
      row.forEach((column, j) => {
        cellData[i][j] = column;
      });
    });
  } else {
    cellData = {
      0: {
        0: {
          m: '',
          v: '',
        },
      },
    };
  }

  const { univerSheetCustom, CommonPluginData } = UniverPreactTs;
  const { DEFAULT_WORKBOOK_DATA } = CommonPluginData;
  const uiSheetsConfig = {
    container: refs,
    layout: {
      sheetContainerConfig: {
        infoBar: false,
        formulaBar: false,
        toolbar,
        sheetBar: false,
        countBar: false,
        rightMenu: false,
      },
    },
  };

  const baseSheetsConfig = {
    selections: {
      'sheet-01': [
        {
          selection: {
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
          },
          cell: {
            row: 0,
            column: 0,
          },
        },
      ],
    },
  };

  let columnCount = 13;
  if (window.innerWidth < 1366) {
    columnCount = 7;
  }
  const config = {
    id: makeid(6),
    styles: null,
    namedRanges: null,
    sheetOrder: ['sheet-01'],
    sheets: {
      'sheet-01': {
        type: 0,
        id: 'sheet-01',
        name: 'sheet1',
        // columnCount,
        status: 1,
        cellData,
        freezeColumn: 1,
        rowCount: 1000,
        columnCount: 20,
        freezeRow: 1,
        zoomRatio: 1,
        scrollTop: 200,
        scrollLeft: 100,
        defaultColumnWidth: 72,
        defaultRowHeight: 19,
        showGridlines: 1,
        rowTitle: {
          width: 46,
          hidden: 0,
        },
        columnTitle: {
          height: 20,
          hidden: 0,
        },
        rowData,
        columnData,
        mergeData,
      },
    },
  };
  if (isPasteSheet) {
    config.sheets['sheet-01'].mergeData = mergeData;
    config.sheets['sheet-01'].rowData = rowData;
    config.sheets['sheet-01'].columnData = columnData;
  }
  const coreConfig = Object.assign({}, DEFAULT_WORKBOOK_DATA, config);

  // 协同
  newDocs('http://' + ipAddress + '/new', univer_config, json => {
    // offline
    if (json == null) {
      const universheet = univerSheetCustom({
        coreConfig,
        uiSheetsConfig,
        baseSheetsConfig,
      });

      cb && cb(universheet);

      return;
    }

    const id = json.id;
    const config = json.config;

    if (config === 'default') {
      updateDocs(id, coreConfig, () => {
        const universheet = univerSheetCustom({
          univerConfig: {
            id,
          },
          coreConfig,
          uiSheetsConfig,
          baseSheetsConfig,
          collaborationConfig: {
            url: `${'ws://' + ipAddress + '/ws/'}${id}`,
          },
        });

        cb && cb(universheet);
      });
    }
  });

  // univerSheetCustom({
  //     coreConfig,
  //     uiSheetsConfig,
  //     baseSheetsConfig
  // })
}
export function initSheetByDemoNew(demo, setting) {
  const { toolbar, refs, univerId, success: cb } = setting;
  const { univerSheetCustom, CommonPluginData, UniverCore } = UniverPreactTs;

  const uiSheetsConfig = {
    container: refs,
    layout: {
      sheetContainerConfig: {
        infoBar: false,
        formulaBar: false,
        toolbar,
        sheetBar: false,
        countBar: false,
        rightMenu: false,
      },
    },
  };

  if (univerId) {
    openDocs(univerId, json => {
      const universheetconfig = json.config;
      const id = json.id;

      const universheet = univerSheetCustom({
        univerConfig: {
          id,
        },
        coreConfig: JSON.parse(universheetconfig),
        uiSheetsConfig,
        collaborationConfig: {
          url: `${'ws://' + ipAddress + '/ws/'}${id}`,
        },
      });

      cb && cb(universheet);
    });

    return;
  }

  const {
    DEFAULT_WORKBOOK_DATA_DEMO1,
    DEFAULT_WORKBOOK_DATA_DEMO2,
    DEFAULT_WORKBOOK_DATA_DEMO3,
    DEFAULT_WORKBOOK_DATA_DEMO4,
    DEFAULT_WORKBOOK_DATA_DEMO5,
    DEFAULT_WORKBOOK_DATA_DEMO6,
  } = CommonPluginData;

  const demoInfo = {
    DEMO1: DEFAULT_WORKBOOK_DATA_DEMO1,
    DEMO2: DEFAULT_WORKBOOK_DATA_DEMO2,
    DEMO3: DEFAULT_WORKBOOK_DATA_DEMO3,
    DEMO4: DEFAULT_WORKBOOK_DATA_DEMO4,
    DEMO5: DEFAULT_WORKBOOK_DATA_DEMO5,
    DEMO6: DEFAULT_WORKBOOK_DATA_DEMO6,
  };

  const baseSheetsConfig = {
    selections: {
      'sheet-01': [
        {
          selection: {
            startRow: 11,
            endRow: 11,
            startColumn: 1,
            endColumn: 1,
          },
          cell: {
            row: 11,
            column: 1,
          },
        },
      ],
    },
  };

  const coreConfig = UniverCore.Tools.deepClone(demoInfo[demo]);

  coreConfig.id = makeid(6);
  coreConfig.sheetOrder = [];

  newDocs('http://' + ipAddress + '/new', univer_config, json => {
    // offline
    if (json == null) {
      const universheet = univerSheetCustom({
        coreConfig,
        uiSheetsConfig,
        baseSheetsConfig,
      });

      cb && cb(universheet);

      return;
    }

    const id = json.id;
    const config = json.config;

    if (config === 'default') {
      updateDocs(id, coreConfig, () => {
        const universheet = univerSheetCustom({
          univerConfig: {
            id,
          },
          coreConfig,
          uiSheetsConfig,
          baseSheetsConfig,
          collaborationConfig: {
            url: `${'ws://' + ipAddress + '/ws/'}${id}`,
          },
        });

        cb && cb(universheet);
      });
    }
  });

  // univerSheetCustom({
  //     coreConfig,
  //     uiSheetsConfig,
  //     baseSheetsConfig
  // })
}
export function initDocNew(setting) {
  const { toolbar, refs } = setting;
  const { univerDocCustom, UniverCore, CommonPluginData } = UniverPreactTs;

  const { DEFAULT_DOCUMENT_DATA_EN } = CommonPluginData;

  const coreConfig = UniverCore.Tools.deepClone(DEFAULT_DOCUMENT_DATA_EN);
  coreConfig.id = makeid(6);
  coreConfig.pageSize = {
    width: 400,
    height: 225,
  };

  const uiDocsConfig = {
    container: refs,
    layout: {
      docContainerConfig: {
        innerRight: false,
        outerLeft: false,
        infoBar: false,
        toolbar,
      },
    },
  };
  const univerdoc = univerDocCustom({
    coreConfig,
    uiDocsConfig,
  });

  window.addEventListener('resize', function (event) {
    console.log('resize doc')
    univerdoc._context
      .getPluginManager()
      .getRequirePluginByName('document').getDocsView().scrollToCenter();
  }, true);
}


function refresh(params) {
  const rootEle = document.querySelector('.affine-default-viewport');
  if (!rootEle) return;

  var config = {
    childList: true,
    subtree: true,
  };
  var time = null;
  new MutationObserver(() => {
    if (time) {
      clearTimeout(time);
      time = null;
    }

    time = setTimeout(() => {

      window.dispatchEvent(new Event('resize', {}));
    }, 500);
  }).observe(rootEle, config);
}

export function initSlideNew(setting) {
  const { toolbar, refs, innerLeft = false } = setting;
  const { univerSlideCustom, UniverCore, CommonPluginData } = UniverPreactTs;
  const { DEFAULT_SLIDE_DATA } = CommonPluginData;

  const coreConfig = UniverCore.Tools.deepClone(DEFAULT_SLIDE_DATA);
  coreConfig.id = makeid(6);

  const uiSlidesConfig = {
    container: refs,
    layout: {
      slideContainerConfig: {
        innerLeft,
        innerRight: false,
        outerLeft: false,
        infoBar: false,
        toolbar,
      },
    },
  };
  const universlide = univerSlideCustom({
    coreConfig,
    uiSlidesConfig,
  });

  window.addEventListener('resize', function (event) {
    console.log('resize slide')
    universlide._context
      .getPluginManager()
      .getPluginByName('slide')
      .getCanvasView()
      .scrollToCenter();
  }, true);
}

export function makeid(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function stopImmediatePropagation(container) {
  container &&
    container.addEventListener('wheel', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('click', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('drag', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('mousedown', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('mousemove', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('keydown', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('keyup', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('cut', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('copy', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('paste', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('compositionstart', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('compositionupdate', e => {
      e.stopImmediatePropagation();
    });
  container &&
    container.addEventListener('compositionend', e => {
      e.stopImmediatePropagation();
    });
}

// 协同

function newDocs(url, params, cb) {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then(document => {
      // 处理获取到的文档信息
      console.log(document);
      cb && cb(document);
    })
    .catch(error => {
      console.error(error);
      cb(null);
    });
}

function openDocs(id, cb) {
  // 定义请求参数
  const data = new FormData();
  data.append('id', id);

  // 创建 XMLHttpRequest 对象
  const xhr = new XMLHttpRequest();

  // 监听请求完成事件
  xhr.onload = function () {
    if (xhr.status === 200) {
      const document = JSON.parse(xhr.responseText);
      // 处理获取到的文档信息
      console.log(document);
      cb && cb(document);
    } else {
      console.error(xhr.statusText);
    }
  };

  // 发送 POST 请求
  xhr.open('POST', 'http://' + ipAddress + '/open', true);
  xhr.send(data);
}

function updateDocs(id, config, cb) {
  // 定义请求参数
  const data = new FormData();
  data.append('id', id);
  data.append('config', JSON.stringify(config));

  // 创建 XMLHttpRequest 对象
  const xhr = new XMLHttpRequest();

  // 监听请求完成事件
  xhr.onload = function () {
    if (xhr.status === 200) {
      const document = JSON.parse(xhr.responseText);
      // 处理获取到的文档信息
      console.log(document);
      cb && cb(document);
    } else {
      console.error(xhr.statusText);
    }
  };

  // 发送 POST 请求
  xhr.open('POST', 'http://' + ipAddress + '/update', true);
  xhr.send(data);
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log('Async: Copying to clipboard was successful!');
    },
    function (err) {
      console.error('Async: Could not copy text: ', err);
    }
  );
}
