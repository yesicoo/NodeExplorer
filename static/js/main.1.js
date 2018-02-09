var zTreeObj ={};
$(document).ready(function () {
    var setting = {
        async: {
            enable: !0,
            dataType: "json",
            url: "/api/fm/dirs",
            autoParam: ["ajax_path=path", "tree_icon=tree_icon"]
        },
        view: {
            showLine: false,
            selectedMulti: false,
            expandSpeed: "fast",
            dblClickExpand: false,
            addDiyDom: function(e, t) {
               console.log(t.level)
                var a = 15
                  , i = $("#" + t.tId + "_switch")
                  , n = $("#" + t.tId + "_ico");
                i.remove(),
                t.iconSkin = t.tree_icon;
                var o = t.tree_icon;
                if (t.ext ? o = t.ext : t.tree_icon || (o = t.type),
                n.before(i).before('<span id="' + t.tId + '_my_ico"  class="tree_icon button"><i class="x-item-file x-folder small"></span>').remove(),
                void 0 != t.ext && n.attr("class", "").addClass("file " + t.ext).removeAttr("style"),
                t.level >= 1) {
                    var s = "<span class='space' style='display: inline-block;width:" + a * t.level + "px'></span>";
                    i.before(s)
                }
                i.before("<div class='menu-item'><div class='cert'></div></div>");
                var r = "";
                void 0 != t.menuType ? r = t.menuType : (("file" == t.type || "oexe" == t.ext) && (r = "menu-tree-file"),
                "folder" == t.type && (r = "menu-tree-folder"));
                var l = "666:666";//LNG.name + ":" + t.name + "\n" + LNG.size + ":" + pathTools.fileSize(t.size) + "\n" + LNG.modify_time + ":" + t.mtime;
                "file" != t.type && (l = t.name),
                i.parent().addClass(r).attr("title", l),
                0 == t.isWriteable && i.parent().addClass("file-not-writeable"),
                0 == t.isReadable && i.parent().addClass("file-not-readable"),
                0 === t.exists && i.parent().addClass("file-not-readable")
            }
        },
        callback: {
            onClick: function (event, fid, node) {
                console.log(event);
                console.log(fid);
                console.log(node);
                if($(event.target).hasClass("menu-item") || $(event.target).parent().hasClass("menu-item")) {
                    var n = $("#" + node.tId + "_a");
                    var o = n.find(".menu-item");
                    return n.contextMenu({ x: o.offset().left + o.width(), y: o.offset().top})
                   // stopPP(e)
                }
            },
            beforeDblClick: function () {
                return !0
            },
            onCollapse: function (e, t, a) {
                0 == a.level 
            },
            onExpand: function (e, t, a) {
                0 == a.level 
            },
            onDblClick: function (e, t, i) {
                return $(e.target).hasClass("switch") || !p() ? !1 : (a.expandNode(i),
                    void 0)
            },
            beforeRightClick: function (e, t) {
                zTreeObj.selectNode(t)
            },
            beforeAsync: function (e, node) {
                node.ajax_name = node.name,
                node.ajax_path = node.path,
                    $("#" + node.tId + "_my_ico").addClass("ico_loading")
            },
            onAsyncSuccess: function (event, fid, node, cnodes) {
                return $("#" + node.tId + "_my_ico").removeClass("ico_loading");
                if(cnodes.data.length==0){
                    zTreeObj.removeChildNodes(node),void 0
                }else{
                    t();
                }
            },
            onRename: function (e, n, o) {
                var s = o.getParentNode();
                if (a.getNodesByParam("name", o.name, s).length > 1)
                    return Tips.tips(LNG.name_isexists, !1),
                        a.removeNode(o),
                        void 0;
                if (o.create) {
                    var r = o.path + "/" + o.name;
                    "folder" == o.type ? i.newFolder(r, function () {
                        t = function () {
                                var e = a.getNodesByParam("name", o.name, s)[0];
                                a.selectNode(e),
                                    b()
                            },
                            h(s)
                    }) : i.newFile(r, function () {
                        t = function () {
                                var e = a.getNodesByParam("name", o.name, s)[0];
                                a.selectNode(e),
                                    b()
                            },
                            h(s)
                    })
                } else {
                    var l = rtrim(o.path, "/"),
                        c = core.pathFather(o.path) + o.name;
                    i.rname(l, c, function (e) {
                        o.path = e,
                            t = function () {
                                var e = a.getNodesByParam("name", o.name, s)[0];
                                a.selectNode(e),
                                    b(),
                                    "folder" == o.type && ui.path.list(o.path)
                            },
                            h(s)
                    })
                }
            },
            beforeDrag: function (e, t) {
                for (var a = 0, i = t.length; i > a; a++)
                    if (t[a].drag === !1)
                        return !1;
                return !0
            },
            beforeDrop: function (e, t, a) {
                return a ? a.drop !== !1 : !0
            },
            onDrop: function (e, t, a, i) {
                var o = "",
                    s = "",
                    r = a[0];
                (r.father || r.thisPath) && (o = r.father + urlEncode(r.name),
                    s = i.father + urlEncode(i.name),
                    n.cuteDrag([{
                        path: o,
                        type: r.type
                    }], s, function () {
                        h(r)
                    }))
            }
        }
    };


    $.post("./api/fm/dirs", { path: '/'}, function (result) {
        zTreeObj = $.fn.zTree.init($("#folder-list-tree_2_ul"), setting, createNode(result,1));
    });
    
    function createNode(nodearray,level){
        let zNodes =[];
        nodearray.forEach(element => {
          var node ={};
          node.name = element;
          node.menuType='folder';
          node.path='/'+element+'/';
          node.isParent = true;
          node.drop=false;
          node.drag=false;
          node.isReadable=1;
          node.isWriteable=1;
          node.level =level;
          zNodes.push(node);
      });
      return zNodes;
    }


});


