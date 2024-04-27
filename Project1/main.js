var dom = document.getElementById('container');
var myChart = echarts.init(dom, null, {
  renderer: 'canvas',
  useDirtyRect: false
});
var app = {};
var option;




$.when(
  $.get('./option-view.json'),
  $.getScript(
    'https://fastly.jsdelivr.net/npm/d3-hierarchy@2.0.0/dist/d3-hierarchy.min.js'
  )
).done(function (res) {
  run(res[0]);
});

function run(rawData) {
  const dataWrap = prepareData(rawData);
  initChart(dataWrap.seriesData, dataWrap.maxDepth);
}

function prepareData(rawData) {
  const seriesData = [];
  let maxDepth = 0;
  function convert(source, basePath, depth) {
    if (source == null) {
      return;
    }
    if (maxDepth > 5) {
      return;
    }
    maxDepth = Math.max(depth, maxDepth);
    seriesData.push({
      id: basePath,
      value: source.$count,
      depth: depth,
      index: seriesData.length
    });
    for (var key in source) {
      if (source.hasOwnProperty(key) && !key.match(/^\$/)) {
        var path = basePath + '.' + key;
        convert(source[key], path, depth + 1);
      }
    }
  }
  convert(rawData, 'option', 0);
  return {
    seriesData: seriesData,
    maxDepth: maxDepth
  };
}

function initChart(seriesData, maxDepth) {
  var displayRoot = stratify();

  function stratify() {
    return d3
      .stratify()
      .parentId(function (d) {
        return d.id.substring(0, d.id.lastIndexOf('.'));
      })(seriesData)
      .sum(function (d) {
        return d.value || 0;
      })
      .sort(function (a, b) {
        return b.value - a.value;
      });
  }

  function color(nodeId, value) {
    // 定义颜色的基础值
    var baseColor;
  
    // 根据节点路径返回预定义的颜色
    if (nodeId.startsWith('option.A')) {
      baseColor = [0, 0, 128,1]; // 蓝色的 RGB 值
    } else if (nodeId.startsWith('option.H')) {
      baseColor = [0, 128, 0,1]; // 绿色的 RGB 值
    } else if (nodeId.startsWith('option.I')) {
      baseColor = [128, 0, 128,1]; // 黄色的 RGB 值
    } else if (nodeId.startsWith('option.E')) {
      baseColor = [128, 128, 0,1]; // 橙色的 RGB 值
    } else if (nodeId.startsWith('option.D')) {
      baseColor = [128, 0, 0,1]; // 红色的 RGB 值
    } else {
      baseColor = [128, 128, 128,0.8]; // 默认灰色的 RGB 值
    }
    

    var colorValue = Math.floor(Math.random() * 128); // 将压缩后的值映射到颜色范围
    var adjustedColor = [
        baseColor[0] + colorValue, // R 通道
        baseColor[1] + colorValue, // G 通道
        baseColor[2] + colorValue, // B 通道
        baseColor[3]
    ];
    
    return 'rgba(' + adjustedColor.join(', ') + ')';
}

  // 在 renderItem 函数中使用 color 函数设置节点颜色
  function renderItem(params, api) {
    var context = params.context;

    // Only do layout once per `setOption` call.
    if (!context.layout) {
      context.layout = true;
      overallLayout(params, api);
    }

    var nodePath = api.value('id');
    var node = context.nodes[nodePath];

    if (!node) {
      // Render nothing.
      return;
    }

    // Get node descendants only once
    var descendants = node.descendants();

    var isLeaf = !node.children || !node.children.length;
    var focus = new Uint32Array(
      descendants.map(function (node) {
        return node.data.index;
      })
    );

    var nodeName = isLeaf
      ? nodePath
          .slice(nodePath.lastIndexOf('.') + 1)
          .split(/(?=[A-Z][^A-Z])/g)
          .join('\n')
      : '';

    var z2 = api.value('depth') * 2;
    var fontSize = Math.max(node.r / 2, 10); // Adjusted fontSize for better fit

    return {
      type: 'circle',
      focus: focus,
      shape: {
        cx: node.x,
        cy: node.y,
        r: node.r
        
      },
      transition: ['shape'],
      z2: z2,
      textContent: {
        type: 'text',
        style: {
          text: nodeName,
          fontFamily: 'Arial',
          width: node.r * 1.5,
          overflow: 'truncate',
          fontSize: fontSize,
          fill: '#ffffff' // 设置字体颜色为白色
        },
        emphasis: {
          style: {
            overflow: null,
            fontSize: fontSize, // Keep fontSize consistent
            fill: '#ffffff' // 设置字体颜色为白色
          }
        }
      },
      textConfig: {
        position: 'inside'
      },
      style: {
        fill: color(nodePath,node.value) // 使用 color 函数设置节点颜色
      },
      emphasis: {
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          shadowBlur: 20,
          shadowOffsetX: 3,
          shadowOffsetY: 5,
          shadowColor: 'rgba(0,0,0,0.3)',
          fill: color(nodePath, node.value), // 设置节点填充颜色
          textFill: '#ffffff' // 设置字体颜色为白色
        }
      },
      
    };
  }

  function overallLayout(params, api) {
    var context = params.context;
    d3
      .pack()
      .size([api.getWidth(), api.getHeight()])
      .padding(5)(displayRoot);
    context.nodes = {};
    displayRoot.descendants().forEach(function (node, index) {
      context.nodes[node.id] = node;
    });
  }

  option = {
    dataset: {
      source: seriesData
    },
    tooltip: {},
    
    hoverLayerThreshold: Infinity,
    series: {
      type: 'custom',
      renderItem: renderItem,
      progressive: 0,
      coordinateSystem: 'none',
      encode: {
        tooltip: 'value',
        itemName: 'id'
      }
    }
  };

  myChart.setOption(option);
  myChart.on('click', { seriesIndex: 0 }, function (params) {
    drillDown(params.data.id);
  });

  function drillDown(targetNodeId) {
    displayRoot = stratify();
    if (targetNodeId != null) {
      displayRoot = displayRoot.descendants().find(function (node) {
        return node.data.id === targetNodeId;
      });
    }
    // A trick to prevent d3-hierarchy from visiting parents in this algorithm.
    displayRoot.parent = null;
    myChart.setOption({
      dataset: {
        source: seriesData
      }
    });
  }
  // Reset: click on the blank area.
  myChart.getZr().on('click', function (event) {
    if (!event.target) {
      drillDown();
    }
  });

  if (option && typeof option === 'object') {
    myChart.setOption(option);
  }

  window.addEventListener('resize', myChart.resize);
  // 创建流体背景画布
const fluidCanvas = document.createElement('canvas');
fluidCanvas.id = 'fluid-background';
document.body.appendChild(fluidCanvas);

// 设置画布尺寸
const canvas = document.getElementById('fluid-background');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// 定义流体参数
const fluidParams = {
  count: 50, // 流体粒子数量
  radius: 50, // 流体粒子半径
  speed: 2, // 流体速度
  colors: ['#ff5733', '#ffc30f', '#33ff5a', '#336aff'] // 流体颜色
};

// 定义流体粒子类
class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * fluidParams.speed;
    this.vy = (Math.random() - 0.5) * fluidParams.speed;
    this.color = fluidParams.colors[Math.floor(Math.random() * fluidParams.colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) {
      this.vx *= -1;
    }
    if (this.y < 0 || this.y > height) {
      this.vy *= -1;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, fluidParams.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// 创建流体粒子数组
let particles = [];
for (let i = 0; i < fluidParams.count; i++) {
  particles.push(new Particle());
}

// 动画循环
function animate() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animate);
}

animate();

// 监听窗口大小变化
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  particles = [];
  for (let i = 0; i < fluidParams.count; i++) {
    particles.push(new Particle());
  }
});
}
