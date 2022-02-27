/*further:
1.pre_path button
2.mark new node compared with last_shown_path*/

import G6 from '@antv/g6';
/*graph show*/
const container = document.getElementById('container');
/*配置这里 颜色*/
var s_color = '#FF0000' //red
var t_color = '#00C957' //green
var default_node_color = '#BBFFFF' //blue
var default_line_color = '#000000' //black
var path_node_color = '#f2f452' //yellow
var path_line_color = '#f2f452'
var diff_new_node_color = '#fa7ab8' //pink
var diff_new_line_color = '#fa7ab8'
var diff_removed_node_color = '#d7d9da'//grey
var highlight_node_color = '#ef7a06'//orange
var highlight_line_color = '#ef7a06'//orange
/*配置这里 图布局*/
const width = container.scrollWidth;
const height = container.scrollHeight || 700;
const graph = new G6.Graph({
    container: 'container',
    width,
    height,
    layout: {
        type: 'force',
        preventOverlap: true,
        nodeSize: 100,
    },
    modes: {
        default: ['drag-node'],
    },
    defaultNode: {
        size: 20,
    },
    defaultEdge: {
        style: {
            stroke: '#000000',
            lineWidth: 2,
        },
    },
});
const data = {
    nodes: [],
    edges: [],
};
graph.data(data);

/*node drag*/
function refreshDragedNodePosition(e) {
    const model = e.item.get('model');
    model.fx = e.x;
    model.fy = e.y;
}
graph.on('node:dragstart', (e) => {
    graph.layout();
    refreshDragedNodePosition(e);
});
graph.on('node:drag', (e) => {
    refreshDragedNodePosition(e);
});
if (typeof window !== 'undefined')
    window.onresize = () => {
        if (!graph || graph.get('destroyed')) return;
        if (!container || !container.scrollWidth || !container.scrollHeight) return;
        graph.changeSize(container.scrollWidth, container.scrollHeight);
    };

/*graph file*/
document.getElementById('graph_file').addEventListener('change', function selectedFileChanged() {
    if (this.files.length === 0) {
        console.log('请选择路径文件！');
        return;
    }
    const gReader = new FileReader();
    gReader.onload = function fileReadCompleted() {
        //clear graph
        data.nodes = []
        data.edges = []

        //fout in gReader.result as str
        var lines = gReader.result.split("\n")
        var lst = lines[0].split(" ")
        var n = parseInt(lst[1])
        var m = parseInt(lst[2])

        //node
        var i = 1
        var e = 0
        for (e = i + n; i < e; ++i) {
            lst = lines[i].split(" ")
            data.nodes.push({
                id: lst[1],
                label: lst[1],
                style: { fill: default_node_color }
            })
            //console.log(i)
        }

        //edge
        for (e = i + m; i < e; ++i) {
            lst = lines[i].split(" ")
            data.edges.push({
                source: lst[1],
                target: lst[2],
            })
            //console.log(i)
        }

        //graph.layout()
        graph.render();
    };
    gReader.readAsText(this.files[0]);
});

/*path file: load into paths*/
const reader = new FileReader();
var paths = []
var paths_length
var path_idx = 0 //current showing path
document.getElementById('path_file').addEventListener('change', function selectedFileChanged() {
    if (this.files.length === 0) {
        console.log('请选择路径文件！');
        return;
    }
    reader.onload = function fileReadCompleted() {
        // 当读取完成时，内容只在`reader.result`中
        paths = reader.result.split("\r\n")
        for (path_idx = 0; path_idx < paths.length;) {
            if (!paths[path_idx]) {
                //remove
                paths.splice(path_idx, 1);
            }
            else {
                ++path_idx;
            }
        }
        paths_length = paths.length
        path_idx = 0

        //set s t color
        var path_lst = paths[path_idx].split("\t")
        const nodes = data.nodes;
        nodes.forEach((node) => {
            //s
            if (node.id == path_lst[0]) {
                node.style.fill = s_color
            }
            //t
            else if (node.id == path_lst[path_lst.length - 1]) {
                node.style.fill = t_color
            }
        })

        //show paths[path_idx]
        console.log(paths[path_idx])
        color_path(paths[path_idx], path_node_color, path_line_color)
        document.getElementById("path_text").innerHTML = paths[path_idx]

        ++path_idx
        graph.render();
    };
    reader.readAsText(this.files[0]);
});

/*next path*/
document.getElementById('next_path_btn').addEventListener('click', function () {
    if (path_idx > 0 && path_idx < paths_length) {
        //clear paths[path_idx-1]
        color_path(paths[path_idx - 1], default_node_color, default_line_color)
        //clear paths[path_idx-2](clear diff shown on paths[path_idx-1])
        if (path_idx > 1) {
            color_path(paths[path_idx - 2], default_node_color, default_line_color)
        }
        //show paths[path_idx]
        console.log(paths[path_idx])
        color_path(paths[path_idx], path_node_color, path_line_color)
        show_path_diff(paths[path_idx], paths[path_idx - 1], diff_new_node_color, diff_new_line_color, diff_removed_node_color)
        graph.render();
        document.getElementById("path_text").innerHTML = paths[path_idx]

        ++path_idx
    }
})
/*pre path*/
document.getElementById('pre_path_btn').addEventListener('click', function () {
    //path_idx-1 is the current shown
    if (path_idx > 1 && path_idx <= paths_length) {
        //clear paths[path_idx-1]
        color_path(paths[path_idx - 1], default_node_color, default_line_color)
        //clear paths[path_idx-2](clear diff shown on paths[path_idx-1]) but as it would be recolored as current path, no need here
        //show paths[path_idx-2]
        console.log(paths[path_idx - 2])
        color_path(paths[path_idx - 2], path_node_color, path_line_color)
        //we still want to reshow the diff from [path_idx - 2] to its previous in "next_path" order
        if (path_idx > 2) {
            show_path_diff(paths[path_idx - 2], paths[path_idx - 3], diff_new_node_color, diff_new_line_color, diff_removed_node_color)
        }
        graph.render();
        document.getElementById("path_text").innerHTML = paths[path_idx - 2]

        --path_idx //make sure path_idx-1 is the next to shown
    }
})
function color_path(path, node_color, line_color) {
    var path_lst = path.split("\t")
    const nodes = data.nodes;
    const edges = data.edges;
    var i = 1
    for (i = 1; i < path_lst.length - 1; ++i) {
        var sv = path_lst[i - 1]
        var tv = path_lst[i]
        //tv
        nodes.forEach((node) => {
            if (node.id == tv) {
                node.style.fill = node_color
            }
        })
        //sv->tv
        edges.forEach((edge) => {
            if ((edge.source == sv && edge.target == tv) || (edge.source == tv && edge.target == sv)) {
                edge.style.stroke = line_color
            }
        })
    }
    //sv->tv
    var sv = path_lst[i - 1]
    var tv = path_lst[i]
    edges.forEach((edge) => {
        if ((edge.source == sv && edge.target == tv) || (edge.source == tv && edge.target == sv)) {
            edge.style.stroke = line_color
        }
    })

}
function show_path_diff(new_path, pre_path, node_color, line_color, removed_node_color) {
    var new_path_lst = new_path.split("\t")
    var pre_path_lst = pre_path.split("\t")
    //node: 
    const nodes = data.nodes;
    //color all new nodes in new_path compared with pre_path in node_color
    for (var i = 0; i < new_path_lst.length; ++i) {
        var id = new_path_lst[i]
        if (!(pre_path_lst.find(element => element == id))) {
            //not in pre
            nodes.forEach((node) => {
                if (node.id == id) {
                    node.style.fill = node_color
                }
            })
        }
    }
    //color all nodes removed from pre_path compared with new_path in removed_node_color
    for (var i = 0; i < pre_path_lst.length; ++i) {
        var id = pre_path_lst[i]
        if (!(new_path_lst.find(element => element == id))) {
            //not in new
            nodes.forEach((node) => {
                if (node.id == id) {
                    node.style.fill = removed_node_color
                }
            })
        }
    }

    //edge: color all new edges in new_path compared with pre_path in line_color
    var new_edge_lst = [], pre_edge_lst = []
    for (var i = 1; i < new_path_lst.length; ++i) {
        new_edge_lst.push(new_path_lst[i - 1] + "_" + new_path_lst[i])
    }
    for (var i = 1; i < pre_path_lst.length; ++i) {
        pre_edge_lst.push(pre_path_lst[i - 1] + "_" + pre_path_lst[i])
    }
    const edges = data.edges;
    for (var i = 0; i < new_edge_lst.length; ++i) {
        var st = new_edge_lst[i]
        var stlst = st.split("_")
        var s = stlst[0]
        var t = stlst[1]
        var st_too = t + "_" + s
        if (!(pre_edge_lst.find(element => element == st || element == st_too))) {
            //not in pre
            edges.forEach((edge) => {
                if ((edge.source == s && edge.target == t) || (edge.source == t && edge.target == s)) {
                    edge.style.stroke = line_color
                    console.log(edge)
                }
            })
        }
    }
}

/*reset: 
1.all node and edge to default color but the first path
2.path_idx=1
but paths and graph are kept
*/
document.getElementById('reset_btn').addEventListener('click', function () {
    path_idx = 0
    var path_lst = paths[path_idx].split("\t")
    const nodes = data.nodes
    const edges = data.edges
    //all node and edge to default color but s t
    edges.forEach((edge) => {
        edge.style.stroke = default_line_color
    })
    nodes.forEach((node) => {
        //s
        if (node.id == path_lst[0]) {
            node.style.fill = s_color
        }
        //t
        else if (node.id == path_lst[path_lst.length - 1]) {
            node.style.fill = t_color
        }
        else {
            node.style.fill = default_node_color
        }
    })
    //first path
    //show paths[path_idx]
    console.log(paths[path_idx])
    color_path(paths[path_idx], path_node_color, path_line_color)
    document.getElementById("path_text").innerHTML = paths[path_idx]

    ++path_idx
    graph.render();
})

/*clear:
1.all node and edge to default color 
2.need to upload path file again*/
document.getElementById('clear_btn').addEventListener('click', function () {
    const nodes = data.nodes
    const edges = data.edges
    //all node and edge to default color
    edges.forEach((edge) => {
        edge.style.stroke = default_line_color
    })
    nodes.forEach((node) => {
        node.style.fill = default_node_color
    })
    graph.render();
})

/*highlight node*/
document.getElementById('highlight_node_btn').addEventListener('click', function () {
    var id = document.getElementById("highlight_node_id").value
    color_node(id, highlight_node_color)
    graph.render();
})
document.getElementById('edge_too_btn').addEventListener('click', function () {
    var id = document.getElementById("highlight_node_id").value
    color_node(id, highlight_node_color)
    color_node_connectingEdge(id, highlight_line_color)
    graph.render();
})
function color_node(id, color) {
    const nodes = data.nodes
    nodes.forEach((node) => {
        if (node.id == id) {
            node.style.fill = color
        }
    })
}
function color_node_connectingEdge(id, color) {
    const edges = data.edges
    edges.forEach((edge) => {
        if (edge.source == id || edge.target == id) {
            edge.style.stroke = color
        }
    })
}