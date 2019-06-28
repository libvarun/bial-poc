
/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  $('#refreshAutodeskTree').hide();
  new Clipboard(".input-group-addon");
  if (getForgeToken() != '') {
    prepareDataManagementTree();
    $('#refreshAutodeskTree').show();
    $('#refreshAutodeskTree').click(function(){
      $('#dataManagementHubs').jstree(true).refresh();
    });
  }

  $.getJSON("/api/forge/clientID", function (res) {
    $("#ClientID").val(res.ForgeClientId);
  });

  $("#provisionAccountSave").click(function () {
    $('#provisionAccountModal').modal('toggle');
    $('#dataManagementHubs').jstree(true).refresh();
  });
});

var haveBIM360Hub = false;
var previousUrn = 0;
var baseurn = '';
var urns = [];
function prepareDataManagementTree() {
  $('#dataManagementHubs').jstree({
    'core': {
      'themes': {"icons": true},
      'data': {
        "url": '/dm/getTreeNode',
        "dataType": "json",
        "multiple": false,
        "cache": false,
        "data": function (node) {
          $('#dataManagementHubs').jstree(true).toggle_node(node);
          return {"id": node.id};
        },
        "success": function (nodes) {
          nodes.forEach(function (n) {
            if (n.type === 'bim360hubs' && n.id.indexOf('b.') > 0)
              haveBIM360Hub = true;
          });

          if (!haveBIM360Hub) {
            $("#provisionAccountModal").modal();
            haveBIM360Hub = true;
          }
        }
      }
    },
    'checkbox' : {
      'tie_selection': false,
      "three_state": false,
      'whole_node': false
    },
    'types': {
      'default': {
        'icon': 'glyphicon glyphicon-question-sign'
      },
      '#': {
        'icon': 'glyphicon glyphicon-user'
      },
      'hubs': {
        'icon': '/img/a360hub.png'
      },
      'personalHub': {
        'icon': '/img/a360hub.png'
      },
      'bim360hubs': {
        'icon': '/img/bim360hub.png'
      },
      'bim360projects': {
        'icon': '/img/bim360project.png'
      },
      'a360projects': {
        'icon': '/img/a360project.png'
      },
      'items': {
        'icon': 'glyphicon glyphicon-file'
      },
      'folders': {
        'icon': 'glyphicon glyphicon-folder-open'
      },
      'versions': {
        'icon': 'glyphicon glyphicon-time'
      }
    },
    "plugins": 
      ["types", "checkbox", "state", "sort"]
  }).bind("select_node.jstree", function (evt, data) {
    if (!data || !data.node) return;
    if (data.node.type == 'items')
      data.node = $('#dataManagementHubs').jstree(true).get_node(data.node.children[0]);

    if (data.node.type == 'versions') {
      if (data.node.id === 'not_available') { alert('No viewable available for this version'); return; }

      baseurn  = data.node.id;
      var filename = $('#dataManagementHubs').jstree(true).get_node(data.node.parent).text;
      var fileType = data.node.original.fileType;

      if (fileType == null || baseurn == null || previousUrn == baseurn) return;
      launchViewer(baseurn, filename, fileType);
      previousUrn = baseurn;
      $.notify("loading... " + filename, { className: "info", position:"bottom right" });
    }
  }).bind("check_node.jstree", function (evt, data) {
    console.log('check_node.jstree')
      console.log(data)
      var urn = data.node.id;
      urns.push(urn)
      loadMultipleURN(urn)
  }).bind("uncheck_node.jstree", function (evt, data) {
    launchViewer(baseurn)
    console.log('check_node.jstree')
      console.log(data)
      var urn = data.node.id;
      for( var i = 0; i < urns.length; i++){ 
        if ( urns[i] === urn) {
          urns.splice(i, 1); 
        }
      }
      for( var i = 0; i < urns.length; i++){ 
        var timer = 100;
        if (i !== 0) {
          timer = timer*i
        }
        window.setTimeout(e => loadMultipleURN(urn[i]), timer); 
      }
  });
}