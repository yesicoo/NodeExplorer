var zTreeObj = {};
Config = {
    BodyContent: ".bodymain",
    FileBoxSelector: ".bodymain .file-continer",
    FileBoxClass: ".bodymain .file-continer .file",
    FileBoxClassName: "file",
    FileBoxTittleClass: ".bodymain .file-continer .title",
    SelectClass: ".bodymain .file-continer .file.select",
    SelectClassName: "select",
    TypeFolderClass: "folder-box",
    TypeFileClass: "file-box",
    HoverClassName: "hover",
    TreeId: "folder-list-tree",
    pageApp: "explorer",
    treeAjaxURL: "explorer/treeList&app=explorer",
    AnimateTime: 200
}
var a = {
    filename: 250,
    filetype: 80,
    filesize: 80,
    filetime: 150,
    explorerTreeWidth: 199,
    editorTreeWidth: 199
};
var t = {
    filename: 250,
    filetype: 80,
    filesize: 80,
    filetime: 150,
    explorerTreeWidth: 199,
    editorTreeWidth: 199
};
var imgSuffixs = ['png', 'jpg', 'bmp', 'gif', 'jpeg', 'ico'];

var clickTimeId, hoverTimeId;
var tipslayer;
var pathHistory = [];
var pathHistory_l = [];
var pathIndex = 0;
var current_path;
$(document).ready(function () {
    document.oncontextmenu = function (e) {
        e.preventDefault();
    };

    current_path = LocalData.get("current_path") || "/";

    var setting = {
        async: {
            enable: true,
            dataType: "json",
            url: "/api/fm/dirs",
            autoParam: ["ajax_path=path", "tree_icon=tree_icon"],
            dataFilter: function (treeId, parentNode, responseData) {
                responseData = createNode(parentNode.path, responseData);
                return responseData;
            }

        },
        view: {
            showLine: false,
            selectedMulti: false,
            expandSpeed: "fast",
            dblClickExpand: false,
            addDiyDom: function (treeId, treeNode) {
                var spwith = 15;
                var n_switch = $("#" + treeNode.tId + "_switch");
                var n_ico = $("#" + treeNode.tId + "_ico");
                n_switch.remove();
                n_ico.before(n_switch).before('<span id="' + treeNode.tId + '_my_ico"  class="tree_icon button"><i class="x-item-file x-folder small"></i></span>').remove();
                if (treeNode.level > 0) {
                    var s = "<span class='space' style='display: inline-block;width:" + spwith * treeNode.level + "px'></span>";
                    n_switch.before(s)
                }
                n_switch.before("<div class='menu-item'><div class='cert'></div></div>");
            }
        },
        callback: {
            onClick: function (event, treeId, treeNode) {
                let path = treeNode.path;
                loadMainPannel(path);
                if (pathHistory_l.length > 0) {
                    pathHistory = [];
                    pathHistory_l = [];
                }

            },
            beforeAsync: function (e, node) {
                node.ajax_name = node.name,
                    node.ajax_path = node.path,
                    $("#" + node.tId + "_my_ico").addClass("ico_loading")
            },
            onAsyncSuccess: function (event, fid, node, cnodes) {
                return $("#" + node.tId + "_my_ico").removeClass("ico_loading");

            }
        }
    };


    $.post("./api/fm/dirs", {
        path: "/"
    }, function (result) {
        let baseFolder = {};
        baseFolder.isParent = true;
        baseFolder.menuType = "menu-tree-root";
        baseFolder.ext = "tree-self"
        baseFolder.open = true;
        baseFolder.name = "我的文档"
        baseFolder.type = "type"
        baseFolder.path = "/"
        baseFolder.children = createNode(baseFolder.path, result);
        zTreeObj = $.fn.zTree.init($("#folder-list-tree"), setting, baseFolder);
        loadMainPannel(current_path, true);
        if (pathHistory_l.length > 0) {
            pathHistory = [];
            pathHistory_l = [];
        }
    });

    var frame_resize = $(".frame-resize");
    frame_resize.drag({
        start: function () {
            frame_resize.addClass("active"),
                $(".resize-mask").css("display", "block")
        },
        move: function (frame_resize) {
            resizeWidth(frame_resize, false, false)
        },
        end: function (t) {
            resizeWidth(t, true, false),
                frame_resize.removeClass("active"),
                $(".resize-mask").css("display", "none")
        }
    })

    $("#main_pannel").delegate(".ico", "mousedown", (e) => {
        clearTimeout(clickTimeId);
        clearTimeout(hoverTimeId);
        clickTimeId = setTimeout(function () {
            if (e.button == 2) {
                console.log("你点了右键");
            } else if (e.button == 0) {
                console.log("你点了左键");
            } else if (e.button == 1) {
                console.log("你点了滚轮");
            }

        }, 500);


    });
    $("#main_pannel").delegate(".ico", "dblclick", (e) => {
        clearTimeout(clickTimeId);
        clearTimeout(hoverTimeId);
        var node = e.currentTarget.parentElement;
        let filetype = e.currentTarget.getAttribute("filetype");
        if (filetype == "folder") {
            var path = node.getAttribute("data-path");
            loadMainPannel(path);
            if (pathHistory_l.length > 0) {
                pathHistory = [];
                pathHistory_l = [];
            }
        } else if (filetype == "file") {
            openfile(e.currentTarget);
        }

    }); //
    $("#main_pannel").delegate(".ico", "mouseover", (e) => {
        clearTimeout(hoverTimeId);
        let description = e.currentTarget.getAttribute("description");
        hoverTimeId = setTimeout(function () {
            tipslayer = layer.tips("<span style='color:#555'>" + description + "</span>", e.currentTarget, {
                tips: [1, '#ccffff'],
                time: 0,
                maxWidth: 600,
                isOutAnim: false,
                anim: -1
            });
        }, 800);
    });
    $("#main_pannel").delegate(".ico", "mouseout", (e) => {
        clearTimeout(hoverTimeId);
        layer.close(tipslayer);
    });


    $("#navBtns").delegate(".path_arrow_btn", "click", (e) => {
        let node = e.currentTarget;
        if (node.style.transform == 'rotate(180deg)') {
            node.style.transform = 'rotate(90deg)';
            hiddenMenu(e);
        } else {
            node.style.transform = 'rotate(180deg)';
            ShowMenu(e);
            let path = node.parentElement.getAttribute("path")
            $.post("./api/fm/dirs", {
                path: path
            }, function (results) {
                if (results) {
                    let htmlStr="";
                    results.forEach(floder=>{
                        htmlStr+='<li path = '+path+'/'+floder+' class="folderMenu"><i class="x-item-file x-folder small"></i><span>'+floder+'</span></li>';
                    });
                    document.getElementById("navigationMenu").innerHTML=htmlStr;
                }
            });

        }

    });
    $("#navBtns").delegate(".path_arrow_btn", "mouseout", (e) => {
        let node = e.currentTarget;
        if (node.style.transform == 'rotate(180deg)') {
            node.style.transform = 'rotate(60deg)';
        }

    })


    $("#navBtns").delegate(".path_name", "click", (e) => {
        let node = e.currentTarget.parentElement;
        let path = node.getAttribute("path")
        loadMainPannel(path);

    });
    $("#navBtns").delegate(".path_name", "mouseover", (e) => {
        let node = e.currentTarget;
        node.style.backgroundColor = "#84c8ff69";
    });

    $("#navBtns").delegate(".path_name", "mouseout", (e) => {
        let node = e.currentTarget;
        node.style.backgroundColor = "";
    });

    $("#navigationMenu").delegate(".folderMenu", "click", (e) => {
        let node = e.currentTarget;
        let path = node.getAttribute("path")
        loadMainPannel(path);
        hiddenAllMenu();
    });


    //监听按键
    $(document).keydown(function (event) {　　　　
        if (event.keyCode == 8) {　　　　　　
            if (pathHistory.length > 0) {

                var lastPath = pathHistory.pop()
                if (lastPath && lastPath.length) {
                    loadMainPannel(lastPath, true);
                    pathHistory_l.push(current_path)
                }
            }
        }　　
    });

    $("#goback").click((e) => {
        if (pathHistory.length > 0) {
            var lastPath = pathHistory.pop()
            if (lastPath && lastPath.length) {
                loadMainPannel(lastPath, true);
                pathHistory_l.push(current_path)
            }
        }
    });
    $("#goadvance").click((e) => {
        if (pathHistory_l.length > 0) {
            var lastPath = pathHistory_l.pop();
            if (lastPath && lastPath.length) {
                loadMainPannel(lastPath);
            }
        }
    });
    $("#gosuperior").click((e) => {
        if (current_path != "/") {
            var path = current_path.substring(0, current_path.lastIndexOf('/'));
            path = path == "" ? "/" : path;
            if (path && path.length) {
                loadMainPannel(path, true);
            }
        }
    });



});

function createNode(path, nodearray) {
    let zNodes = [];
    nodearray.forEach(element => {
        var node = {};
        node.name = element;
        node.menuType = 'folder';
        node.path = path +"/"+ element;
        node.isParent = true;
        node.drop = false;
        node.drag = false;
        node.isReadable = 1;
        node.isWriteable = 1;
        zNodes.push(node);
    });
    return zNodes;
}

function resizeWidth(i, isSaveConfig, s) {

    if (!$(".frame-left").is(":hidden")) {
        var r = Config.pageApp + "TreeWidth";
        var l = $.extend(true, {}, a);
        l[r] += i,
            l[r] <= t[r] && (l[r] = t[r]);
        var c = l[r]
        var d = $(".frame-left")
        var p = $(".frame-resize")
        var u = $(".frame-right")
        var f = a[r];
        if (c > f - 8 && f + 8 > c && (c = f + 1), s) {
            var h = 400;
            d.animate({
                    width: c
                }, h),
                p.animate({
                    left: c - 5
                }, h),
                u.animate({
                    left: c
                }, h)
        } else {
            d.css("width", c),
                p.css("left", c - 5),
                u.css("left", c);
        }
        // ui.setStyle !== void 0 && ui.setStyle(), o && (a = l,n())
        if (isSaveConfig) {
            a = l;
            saveResizeConfig(l);
        }
    }
}

function saveResizeConfig(data) {
    var e = JSON.stringify(data);
    LocalData.set("resizeConfig", e)
}

function loadMainPannel(path, fromPop) {
    var isPop = fromPop || false;
    $.post("./api/fm/dirfiles", {
        path: path
    }, function (result) {
        if (result.Error == "") {
            var htmlStr = '';

            result.Dirs.forEach(dir => {
                htmlStr += '<div data-path="' + dir.path + '" class="file  folder-box menu-folder" title="" data-size="0">';

                htmlStr += '<div class="ico" filetype="folder" description="' + dir.description + '">';
                htmlStr += '<i class="x-item-file x-folder"></i>';
                htmlStr += '</div>';
                htmlStr += '<div class="filename">';
                htmlStr += '<span class="title db-click-rename" title="' + dir.name + '">' + dir.name + '</span>';
                htmlStr += '</div>';
                htmlStr += '</div>';
            });
            result.Files.forEach(file => {
                htmlStr += '<div data-path="' + file.path + '" class="file  folder-box menu-folder" title="" data-size="0">';

                htmlStr += '<div class="ico" filetype="file" description="' + file.description + '">';
                if (imgSuffixs.indexOf(file.suffix) > -1) {
                    htmlStr += '<img src="' + file.icon + '" class="q_imgtype" suffix="' + file.suffix + '" >';

                } else {
                    htmlStr += '<img src="' + file.icon + '" suffix="' + file.suffix + '">';
                }
                htmlStr += '</div>';
                htmlStr += '<div class="filename">';
                htmlStr += '<span class="title db-click-rename" title="' + file.name + '">' + file.name + '</span>';
                htmlStr += '</div>';
                htmlStr += '</div>';
            });
            $("#main_pannel").html(htmlStr);
            if (!isPop) {
                pathHistory.push(current_path);
            }
            current_path = path;
            LocalData.set("current_path", path);
            RefushNavigation();
            lazyLoadImg();

            if (pathHistory.length > 0) {
                $("#goback").css("opacity", "0.6");
            } else {
                $("#goback").css("opacity", "0.3");
            }

            if (pathHistory_l.length > 0) {
                $("#goadvance").css("opacity", "0.6");
            } else {
                $("#goadvance").css("opacity", "0.3");
            }
        } else {
            layer.msg(result.Error, {
                anim: 2,
                maxWidth: 600
            });
        }
    });
}

function lazyLoadImg() {
    var nodes = document.querySelectorAll('.q_imgtype');
    var viewerHtml = '';
    nodes.forEach(node => {
        let path = node.parentElement.parentElement.getAttribute("data-path");
        $.post("./api/fm/base64img", {
            path: path
        }, function (result) {
            node.setAttribute("src", result);
        });

    });
}

function openfile(node) {
    var imgNode = node.childNodes[0];
    var suffix = imgNode.getAttribute("suffix")
    var img = new Image();
    img.src = imgNode.getAttribute("src");
    var romWidth = node.parentElement.parentElement.clientWidth / 5 * 4;
    var romHeight = romWidth / img.width * img.height

    if (imgSuffixs.indexOf(suffix) > -1) {
        var contentHtml = '<image style="  width: ' + romWidth + ';  height: ' + romHeight + '; max-width: 100%;   max-height: 100%;   " src ="' + imgNode.getAttribute("src") + '">'
        layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            skin: 'layui-layer-nobg', //没有背景色
            shadeClose: true,
            maxWidth: romWidth,
            content: contentHtml
        });
    } else {
        path = node.parentElement.getAttribute("data-path");
        $.post("./api/fm/open", {
            path: path
        });
    }
}

function downLoadJs(url) {
    var elem = document.createElement("script");
    elem.src = url;
    document.body.appendChild(elem);
}

function downLoadCss(url) {
    var elem = document.createElement("link");
    elem.rel = "stylesheet";
    elem.type = "text/css";
    elem.href = url;
    document.body.appendChild(elem);
}

function RefushNavigation() {
    let pathArray = current_path.split("/");
    let htmlStr = '<div class="homeBtn" id="home_btn"><img height=55% src="/images/home.png"></div>';
    htmlStr += '<div class="pathBtn" path="/"><span class="path_name">根目录</span><img height=25% src="/images/arrow-up.png" class="path_arrow_btn"></div>';
    let pathStr = "";
    pathArray.forEach(path => {
        if (path.length != 0) {
            pathStr += '/' + path
            htmlStr += '<div class="pathBtn" path="' + pathStr + '"><span class="path_name">' + path + '</span><img height=25% src="/images/arrow-up.png" class="path_arrow_btn"  menuid="navigationMenu"></div>';
        }

    });
    $("#navBtns").html(htmlStr);
}

function ShowMenu(event) {
    let menuid = event.currentTarget.getAttribute("menuid");
    var menuNode = document.getElementById(menuid);
    if (menuNode) {
        if (event.clientX + 242 > screen.availWidth) {
            menuNode.style.left = event.clientX - 242 + 'px';
        } else {
            menuNode.style.left = event.clientX + 'px';
        }
        if (event.clentY + 122 > screen.availHeight) {
            menuNode.style.top = event.clientY - 122 + 'px';
        } else {
            menuNode.style.top = event.clientY + 'px';
        }
        menuNode.style.visibility = 'visible';
    }
    return false;
}

function hiddenMenu(e) {
    let menuid = e.currentTarget.getAttribute("menuid");
    var menuNode = document.getElementById(menuid);
    menuNode.style.visibility = 'hidden';
}

function hiddenAllMenu() {
    let nodes = document.querySelectorAll(".client_menu");
    nodes.forEach(node => {
        node.style.visibility = 'hidden';
    });
}