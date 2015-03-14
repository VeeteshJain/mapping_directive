var app = angular.module('plunker', ['ui.bootstrap.position']);


angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
*/
.factory('$position', ['$document', '$window', function ($document, $window) {

  function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
     function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
     var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
       position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
       offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
       positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
        targetElWidth,
        targetElHeight,
        targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var shiftWidth = {
          center: function () {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function () {
            return hostElPos.left;
          },
          right: function () {
            return hostElPos.left + hostElPos.width;
          }
        };

        var shiftHeight = {
          center: function () {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function () {
            return hostElPos.top;
          },
          bottom: function () {
            return hostElPos.top + hostElPos.height;
          }
        };

        switch (pos0) {
          case 'right':
          targetElPos = {
            top: shiftHeight[pos1](),
            left: shiftWidth[pos0]()
          };
          break;
          case 'left':
          targetElPos = {
            top: shiftHeight[pos1](),
            left: hostElPos.left - targetElWidth
          };
          break;
          case 'bottom':
          targetElPos = {
            top: shiftHeight[pos0](),
            left: shiftWidth[pos1]()
          };
          break;
          default:
          targetElPos = {
            top: hostElPos.top - targetElHeight,
            left: shiftWidth[pos1]()
          };
          break;
        }
        debugger;
        return targetElPos;
      }
    };
  }]);


app.directive('fixedHeaderFooter',['$timeout','$compile','$window','$document', '$position', function($timeout,$compile,$window,$document, $position){
  function link(scope, el, attrs){
    var cloneNode = el.clone();
    cloneNode.find('tbody').empty();
    cloneNode.removeAttr('fixed-header-footer');
    cloneNode.css({
      'background-color':'red',
      'z-index': 2,
      'margin-bottom': '0px',
      'border-collapse': 'collapse',
      'display': 'table',
      'margin': '0px',
      'table-layout': 'fixed'
    });
    var cloneHeadFoot = {
      'thead': cloneNode.clone(),
      'tfoot': cloneNode.clone()
    };
    cloneHeadFoot.thead.find('tfoot').empty();
    cloneHeadFoot.tfoot.find('thead').empty();
    cloneHeadFoot.tfoot.css({'background-color':'blue'});

    var elHead = $compile(cloneHeadFoot.thead)(scope, function(){});
    var elFoot = $compile(cloneHeadFoot.tfoot)(scope, function(){});
    /*
    //append to body case
    var container = $document.find('body');
    container.append(elHead);
    container.append(elFoot);*/
    var container = el;
    var tablecontainer = $document.find('tablecontainer');
    tablecontainer.wrap('<div style="position: relative;clear: both;"></div>');
    debugger;
    /*
    //append in parallel to table element
    el.after(elHead);
    el.after(elFoot);*/
    tablecontainer.append(elHead);
    tablecontainer.append(elFoot);
    elHead = elHead.wrap('<div></div>').parent();
    elFoot = elFoot.wrap('<div></div>').parent();
    function refreshHeaderFooter(){
      debugger;
      var defaultStyle = {
        'position': 'absolute',
        'overflow': 'hidden',
        'padding-left': '0px',
        'padding-right': '0px',
        'margin-top': '0px'
      };
      var headerStyle = {},
      footerStyle = {};
      var pageYOffset = $window.pageYOffset;
      angular.extend(headerStyle, defaultStyle);
      angular.extend(footerStyle, defaultStyle);
      debugger;
      angular.extend(headerStyle, $position.offset(el.find('thead')));
      angular.extend(footerStyle, $position.offset(el.find('tfoot')));

      angular.extend(headerStyle, {width: $position.offset(el).width});
      angular.extend(footerStyle, {width: $position.offset(el).width});

      topCorrection(headerStyle, pageYOffset);
      topCorrection(footerStyle, pageYOffset);
      headerStyle.top = 0;
      var parnetContainer = $position.offset(el.parent());
      var topCorr = $window.pageYOffset - parnetContainer.top;
      if(topCorr > 0 && parnetContainer.height >= topCorr){
        headerStyle.top += topCorr;
      }
      addPx(headerStyle);

      debugger;

      delete footerStyle.top;
      var bottomCorr = (parnetContainer.top + parnetContainer.height) - (pageYOffset + $window.innerHeight);
      footerStyle.bottom = 0;
      if(bottomCorr > 0 && bottomCorr <= parnetContainer.height){
        footerStyle.bottom += bottomCorr;
      }
      addPx(footerStyle);
      footerStyle.bottom += 'px';
      elHead.css(headerStyle);
      elFoot.css(footerStyle);
    }
    function headStickTop(){
      debugger;
    }
    function footStickBottom(){
      debugger;
    }
    function topCorrection(styles, pageYOffset){
      styles.top -= pageYOffset;
      return styles;
    }
    function bottomCorrection(styles, pageYOffset){
      styles.top -= pageYOffset;
      return styles;
    }
    function addPx(styles){
      styles.top += 'px';
      styles.left += 'px';
      styles.width += 'px';
      styles.height += 'px';
      delete styles.height;
      delete styles.left;
      return styles;
    }
    $timeout(function(){
      refreshHeaderFooter();
    },1000);
    angular.element($window).on('resize scroll', function() {
      $timeout(function(){
        refreshHeaderFooter();
      });
    });
  }
  return{
    link:link,

  }
}]);

app.directive('tableFixedHeaderFooter',['$timeout','$document','$window','$compile',function($timeout,$document,$window,$compile){
  function link(scope , el , attrs , ngModel){
    if(!ngModel){
      return;
    }
    ngModel.$render = function() {
      //element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
    };
    var w = angular.element($window);
    w.on('resize', function() {
      scope.$apply(read);
    });
    read();
    function read(){
      var html = el.html();
      var columnWidth = [];
      angular.forEach(el.find('tbody tr:first td') , function(v , i){
        var value = angular.element(v);
        columnWidth[i] = value.outerWidth();

      });
      // When we clear the content editable the browser leaves a <br> behind
      // If strip-br attribute is provided then we strip this out
      
      ngModel.$setViewValue(columnWidth);
    }

    console.log('all ok');
    var clonedNode = el.clone();
    scope.options = {
      header:{
        colWidth : [12,12,12,12],
        tableWidth:0,
        position:'absolute',
        top:0,
        left:0,
        'z-index':2000,
        margin:0,
        'background-color':'red'
      },
      footer:{
        colWidth : [12,12,12,12],
        tableWidth:0,
        position:'absolute',
        top:0,
        left:0,
        'z-index':2000,
        margin:0,
        'background-color':'red'
      }
    };
    scope.colWidth = [12,12,12,12];
    clonedNode.find('tbody').empty();
    debugger;
    clonedNode.removeAttr('table-fixed-header-footer').removeAttr('refresh');
    var ngStyleHeader = '{width:options.header.tableWidth , position:options.header.position , top:options.header.top , left:options.header.left , margin:options.header.margin , "z-index":options.header["z-index"] , "background-color":options.header["background-color"]}';
    var ngStyleFooter = '{width:options.footer.tableWidth , position:options.footer.position , top:options.footer.top , left:options.footer.left , margin:options.footer.margin , "z-index":options.footer["z-index"] , "background-color":options.footer["background-color"]}';
    //clonedNode.attr('ng-style','{width:options.tableWidth , position:options.position , top:options.top , left:options.left , margin:options.margin , "z-index":options["z-index"] , "background-color":options["background-color"]}');
    headerFooter = [clonedNode.clone().attr('ng-style',ngStyleHeader),clonedNode.clone().attr('ng-style',ngStyleFooter)];
    var type = attrs.tableFixedHeaderFooter.split('-');
    angular.forEach(type , function(v , i ){
      switch(v){
        case 'tfoot':
        headerFooter[i].find('thead').empty();
        break;
        default:
        //header
        headerFooter[i].find('tfoot').empty();
        break;
      }
      angular.forEach(headerFooter[i].find(v+' tr:first th'), function(v , i){
        if(i===0){
          angular.element(v).attr('ng-style','{width:options.header.colWidth['+i+']}');
        }else{
          angular.element(v).attr('ng-style','{width:options.footer.colWidth['+i+']}');
        }
      });
    });
    //append to body
    var header = $compile(headerFooter[0][0].outerHTML)(scope,function(){});
    var footer = $compile(headerFooter[1][0].outerHTML)(scope,function(){});

    angular.element('body').append(header);
    angular.element('body').append(footer);
    
    //cloning the current element properties
    
    function reposition(){
      var options = {
        width:'',
        height:'',
        position:'absolute',
        offset:{'top':'',left:''}
      };
    //for header
    options.offset = el.offset();
    if(options.offset.top < $window.pageYOffset && $window.pageYOffset < el.find('tfoot').offset().top ){
      options.offset.top = 0;
      options.position = 'fixed';
    }
    header.css({
      width:el.outerWidth(true),
      //height:el.outerHeight(true),
      position:options.position,
      top:options.offset.top,
      left:options.offset.left,
      margin:0,
      'z-index':2000,
      'background-color':'red'
    });
    options = {
      width:'',
      height:'',
      position:'absolute',
      offset:{'top':'',left:''}
    };
    //for footer
    options.offset = el.find('tfoot').offset();
    if( options.offset.top > $window.pageYOffset && ($window.pageYOffset+$window.innerHeight) > el.offset().top && ($window.pageYOffset+$window.innerHeight) < options.offset.top ){
      options.offset.top = $window.innerHeight - el.find('tfoot').height();
      options.position = 'fixed';
    }
    footer.css({
      width:el.outerWidth(true),
      //height:el.outerHeight(true),
      position:options.position,
      top:options.offset.top,
      left:options.offset.left,
      margin:0,
      'z-index':2000,
      'background-color':'red'
    });
    angular.forEach(el.find('tbody tr:first td'), function(v , i){
    });
    
    console.log('reposition');
  }
  reposition();

  attrs.$observe('refresh' , function(newVal , oldVal){
    console.log('aa '+newVal);
    if(newVal === 'true'){
      reposition();
    }
  });

  $document.bind('scroll', function(event){
    console.log('scroll');
    reposition();
  });
  var win = angular.element($window);
  win.bind('resize', function(event){
    console.log('resize');
    reposition();
  });
}
return{
  restrict: 'EA',
  link: link,
  require: '?ngModel'
};
}]);


function ListCtrl($scope) {

  var allItems = [{"id":860,"firstName":"Superman","lastName":"Yoda"},{"id":870,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":590,"firstName":"Toto","lastName":"Titi"},{"id":803,"firstName":"Luke","lastName":"Kyle"},{"id":474,"firstName":"Toto","lastName":"Bar"},{"id":476,"firstName":"Zed","lastName":"Kyle"},{"id":464,"firstName":"Cartman","lastName":"Kyle"},{"id":505,"firstName":"Superman","lastName":"Yoda"},{"id":308,"firstName":"Louis","lastName":"Kyle"},{"id":184,"firstName":"Toto","lastName":"Bar"},{"id":411,"firstName":"Luke","lastName":"Yoda"},{"id":154,"firstName":"Luke","lastName":"Moliku"},{"id":623,"firstName":"Someone First Name","lastName":"Moliku"},{"id":499,"firstName":"Luke","lastName":"Bar"},{"id":482,"firstName":"Batman","lastName":"Lara"},{"id":255,"firstName":"Louis","lastName":"Kyle"},{"id":772,"firstName":"Zed","lastName":"Whateveryournameis"},{"id":398,"firstName":"Zed","lastName":"Moliku"},{"id":840,"firstName":"Superman","lastName":"Lara"},{"id":894,"firstName":"Luke","lastName":"Bar"},{"id":591,"firstName":"Luke","lastName":"Titi"},{"id":767,"firstName":"Luke","lastName":"Moliku"},{"id":133,"firstName":"Cartman","lastName":"Moliku"},{"id":274,"firstName":"Toto","lastName":"Lara"},{"id":996,"firstName":"Superman","lastName":"Someone Last Name"},{"id":780,"firstName":"Batman","lastName":"Kyle"},{"id":931,"firstName":"Batman","lastName":"Moliku"},{"id":326,"firstName":"Louis","lastName":"Bar"},{"id":318,"firstName":"Superman","lastName":"Yoda"},{"id":434,"firstName":"Zed","lastName":"Bar"},{"id":480,"firstName":"Toto","lastName":"Kyle"},{"id":187,"firstName":"Someone First Name","lastName":"Bar"},{"id":829,"firstName":"Cartman","lastName":"Bar"},{"id":937,"firstName":"Cartman","lastName":"Lara"},{"id":355,"firstName":"Foo","lastName":"Moliku"},{"id":258,"firstName":"Someone First Name","lastName":"Moliku"},{"id":826,"firstName":"Cartman","lastName":"Yoda"},{"id":586,"firstName":"Cartman","lastName":"Lara"},{"id":32,"firstName":"Batman","lastName":"Lara"},{"id":676,"firstName":"Batman","lastName":"Kyle"},{"id":403,"firstName":"Toto","lastName":"Titi"},{"id":222,"firstName":"Foo","lastName":"Moliku"},{"id":507,"firstName":"Zed","lastName":"Someone Last Name"},{"id":135,"firstName":"Superman","lastName":"Whateveryournameis"},{"id":818,"firstName":"Zed","lastName":"Yoda"},{"id":321,"firstName":"Luke","lastName":"Kyle"},{"id":187,"firstName":"Cartman","lastName":"Someone Last Name"},{"id":327,"firstName":"Toto","lastName":"Bar"},{"id":187,"firstName":"Louis","lastName":"Lara"},{"id":417,"firstName":"Louis","lastName":"Titi"},{"id":97,"firstName":"Zed","lastName":"Bar"},{"id":710,"firstName":"Batman","lastName":"Lara"},{"id":975,"firstName":"Toto","lastName":"Yoda"},{"id":926,"firstName":"Foo","lastName":"Bar"},{"id":976,"firstName":"Toto","lastName":"Lara"},{"id":680,"firstName":"Zed","lastName":"Kyle"},{"id":275,"firstName":"Louis","lastName":"Kyle"},{"id":742,"firstName":"Foo","lastName":"Someone Last Name"},{"id":598,"firstName":"Zed","lastName":"Lara"},{"id":113,"firstName":"Foo","lastName":"Moliku"},{"id":228,"firstName":"Superman","lastName":"Someone Last Name"},{"id":820,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":700,"firstName":"Cartman","lastName":"Someone Last Name"},{"id":556,"firstName":"Toto","lastName":"Lara"},{"id":687,"firstName":"Foo","lastName":"Kyle"},{"id":794,"firstName":"Toto","lastName":"Lara"},{"id":349,"firstName":"Someone First Name","lastName":"Whateveryournameis"},{"id":283,"firstName":"Batman","lastName":"Someone Last Name"},{"id":862,"firstName":"Cartman","lastName":"Lara"},{"id":674,"firstName":"Cartman","lastName":"Bar"},{"id":954,"firstName":"Louis","lastName":"Lara"},{"id":243,"firstName":"Superman","lastName":"Someone Last Name"},{"id":578,"firstName":"Superman","lastName":"Lara"},{"id":660,"firstName":"Batman","lastName":"Bar"},{"id":653,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":583,"firstName":"Toto","lastName":"Moliku"},{"id":321,"firstName":"Zed","lastName":"Yoda"},{"id":171,"firstName":"Superman","lastName":"Kyle"},{"id":41,"firstName":"Superman","lastName":"Yoda"},{"id":704,"firstName":"Louis","lastName":"Titi"},{"id":344,"firstName":"Louis","lastName":"Lara"},{"id":840,"firstName":"Toto","lastName":"Whateveryournameis"},{"id":476,"firstName":"Foo","lastName":"Kyle"},{"id":644,"firstName":"Superman","lastName":"Moliku"},{"id":359,"firstName":"Superman","lastName":"Moliku"},{"id":856,"firstName":"Luke","lastName":"Lara"},{"id":760,"firstName":"Foo","lastName":"Someone Last Name"},{"id":432,"firstName":"Zed","lastName":"Yoda"},{"id":299,"firstName":"Superman","lastName":"Kyle"},{"id":693,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":11,"firstName":"Toto","lastName":"Lara"},{"id":305,"firstName":"Luke","lastName":"Yoda"},{"id":961,"firstName":"Luke","lastName":"Yoda"},{"id":54,"firstName":"Luke","lastName":"Bar"},{"id":734,"firstName":"Superman","lastName":"Yoda"},{"id":466,"firstName":"Cartman","lastName":"Titi"},{"id":439,"firstName":"Louis","lastName":"Lara"},{"id":995,"firstName":"Foo","lastName":"Moliku"},{"id":878,"firstName":"Luke","lastName":"Bar"},{"id":479,"firstName":"Luke","lastName":"Yoda"},{"id":252,"firstName":"Cartman","lastName":"Moliku"},{"id":355,"firstName":"Zed","lastName":"Moliku"},{"id":355,"firstName":"Zed","lastName":"Kyle"},{"id":694,"firstName":"Louis","lastName":"Bar"},{"id":882,"firstName":"Cartman","lastName":"Yoda"},{"id":620,"firstName":"Luke","lastName":"Lara"},{"id":390,"firstName":"Superman","lastName":"Lara"},{"id":247,"firstName":"Zed","lastName":"Kyle"},{"id":510,"firstName":"Batman","lastName":"Moliku"},{"id":510,"firstName":"Batman","lastName":"Lara"},{"id":472,"firstName":"Foo","lastName":"Moliku"},{"id":533,"firstName":"Someone First Name","lastName":"Kyle"},{"id":725,"firstName":"Superman","lastName":"Kyle"},{"id":221,"firstName":"Zed","lastName":"Lara"},{"id":302,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":755,"firstName":"Louis","lastName":"Someone Last Name"},{"id":671,"firstName":"Batman","lastName":"Lara"},{"id":649,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":22,"firstName":"Luke","lastName":"Yoda"},{"id":544,"firstName":"Louis","lastName":"Lara"},{"id":114,"firstName":"Someone First Name","lastName":"Titi"},{"id":674,"firstName":"Someone First Name","lastName":"Lara"},{"id":571,"firstName":"Zed","lastName":"Kyle"},{"id":554,"firstName":"Louis","lastName":"Titi"},{"id":203,"firstName":"Zed","lastName":"Kyle"},{"id":89,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":299,"firstName":"Luke","lastName":"Bar"},{"id":48,"firstName":"Toto","lastName":"Bar"},{"id":726,"firstName":"Batman","lastName":"Whateveryournameis"},{"id":121,"firstName":"Toto","lastName":"Bar"},{"id":992,"firstName":"Superman","lastName":"Whateveryournameis"},{"id":551,"firstName":"Toto","lastName":"Kyle"},{"id":831,"firstName":"Louis","lastName":"Lara"},{"id":940,"firstName":"Luke","lastName":"Moliku"},{"id":974,"firstName":"Zed","lastName":"Kyle"},{"id":579,"firstName":"Luke","lastName":"Moliku"},{"id":752,"firstName":"Cartman","lastName":"Yoda"},{"id":873,"firstName":"Batman","lastName":"Someone Last Name"},{"id":939,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":240,"firstName":"Luke","lastName":"Yoda"},{"id":969,"firstName":"Cartman","lastName":"Lara"},{"id":247,"firstName":"Luke","lastName":"Someone Last Name"},{"id":3,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":154,"firstName":"Batman","lastName":"Bar"},{"id":274,"firstName":"Toto","lastName":"Someone Last Name"},{"id":31,"firstName":"Luke","lastName":"Someone Last Name"},{"id":789,"firstName":"Louis","lastName":"Titi"},{"id":634,"firstName":"Zed","lastName":"Yoda"},{"id":972,"firstName":"Toto","lastName":"Kyle"},{"id":199,"firstName":"Foo","lastName":"Moliku"},{"id":562,"firstName":"Louis","lastName":"Titi"},{"id":460,"firstName":"Superman","lastName":"Yoda"},{"id":817,"firstName":"Cartman","lastName":"Someone Last Name"},{"id":307,"firstName":"Cartman","lastName":"Bar"},{"id":10,"firstName":"Cartman","lastName":"Titi"},{"id":167,"firstName":"Toto","lastName":"Someone Last Name"},{"id":107,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":432,"firstName":"Batman","lastName":"Kyle"},{"id":381,"firstName":"Luke","lastName":"Yoda"},{"id":517,"firstName":"Louis","lastName":"Lara"},{"id":575,"firstName":"Superman","lastName":"Kyle"},{"id":716,"firstName":"Cartman","lastName":"Titi"},{"id":646,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":144,"firstName":"Someone First Name","lastName":"Yoda"},{"id":306,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":395,"firstName":"Luke","lastName":"Bar"},{"id":777,"firstName":"Toto","lastName":"Moliku"},{"id":624,"firstName":"Louis","lastName":"Someone Last Name"},{"id":994,"firstName":"Superman","lastName":"Moliku"},{"id":653,"firstName":"Batman","lastName":"Moliku"},{"id":198,"firstName":"Foo","lastName":"Bar"},{"id":157,"firstName":"Zed","lastName":"Kyle"},{"id":955,"firstName":"Luke","lastName":"Someone Last Name"},{"id":339,"firstName":"Foo","lastName":"Bar"},{"id":552,"firstName":"Batman","lastName":"Titi"},{"id":735,"firstName":"Louis","lastName":"Bar"},{"id":294,"firstName":"Batman","lastName":"Bar"},{"id":287,"firstName":"Someone First Name","lastName":"Bar"},{"id":399,"firstName":"Cartman","lastName":"Yoda"},{"id":741,"firstName":"Foo","lastName":"Kyle"},{"id":670,"firstName":"Foo","lastName":"Bar"},{"id":260,"firstName":"Toto","lastName":"Lara"},{"id":294,"firstName":"Toto","lastName":"Titi"},{"id":294,"firstName":"Zed","lastName":"Lara"},{"id":840,"firstName":"Zed","lastName":"Titi"},{"id":448,"firstName":"Foo","lastName":"Kyle"},{"id":260,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":119,"firstName":"Zed","lastName":"Someone Last Name"},{"id":702,"firstName":"Zed","lastName":"Kyle"},{"id":87,"firstName":"Zed","lastName":"Someone Last Name"},{"id":161,"firstName":"Foo","lastName":"Lara"},{"id":404,"firstName":"Zed","lastName":"Kyle"},{"id":871,"firstName":"Toto","lastName":"Lara"},{"id":908,"firstName":"Someone First Name","lastName":"Moliku"},{"id":484,"firstName":"Louis","lastName":"Bar"},{"id":966,"firstName":"Cartman","lastName":"Titi"},{"id":392,"firstName":"Someone First Name","lastName":"Lara"},{"id":738,"firstName":"Batman","lastName":"Lara"},{"id":560,"firstName":"Louis","lastName":"Kyle"},{"id":507,"firstName":"Zed","lastName":"Whateveryournameis"},{"id":660,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":929,"firstName":"Superman","lastName":"Moliku"},{"id":42,"firstName":"Batman","lastName":"Moliku"},{"id":853,"firstName":"Luke","lastName":"Titi"},{"id":977,"firstName":"Louis","lastName":"Moliku"},{"id":104,"firstName":"Toto","lastName":"Kyle"},{"id":820,"firstName":"Luke","lastName":"Someone Last Name"},{"id":187,"firstName":"Batman","lastName":"Titi"},{"id":524,"firstName":"Louis","lastName":"Yoda"},{"id":830,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":156,"firstName":"Someone First Name","lastName":"Lara"},{"id":918,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":286,"firstName":"Batman","lastName":"Moliku"},{"id":715,"firstName":"Louis","lastName":"Kyle"},{"id":501,"firstName":"Superman","lastName":"Whateveryournameis"},{"id":463,"firstName":"Foo","lastName":"Kyle"},{"id":419,"firstName":"Toto","lastName":"Yoda"},{"id":752,"firstName":"Foo","lastName":"Moliku"},{"id":754,"firstName":"Louis","lastName":"Titi"},{"id":497,"firstName":"Someone First Name","lastName":"Kyle"},{"id":722,"firstName":"Louis","lastName":"Moliku"},{"id":986,"firstName":"Batman","lastName":"Someone Last Name"},{"id":908,"firstName":"Someone First Name","lastName":"Titi"},{"id":559,"firstName":"Superman","lastName":"Bar"},{"id":816,"firstName":"Foo","lastName":"Bar"},{"id":517,"firstName":"Louis","lastName":"Bar"},{"id":188,"firstName":"Superman","lastName":"Bar"},{"id":762,"firstName":"Batman","lastName":"Someone Last Name"},{"id":872,"firstName":"Batman","lastName":"Titi"},{"id":107,"firstName":"Louis","lastName":"Lara"},{"id":968,"firstName":"Louis","lastName":"Moliku"},{"id":643,"firstName":"Toto","lastName":"Someone Last Name"},{"id":88,"firstName":"Toto","lastName":"Titi"},{"id":844,"firstName":"Foo","lastName":"Kyle"},{"id":334,"firstName":"Batman","lastName":"Someone Last Name"},{"id":43,"firstName":"Zed","lastName":"Lara"},{"id":600,"firstName":"Someone First Name","lastName":"Kyle"},{"id":719,"firstName":"Luke","lastName":"Lara"},{"id":698,"firstName":"Zed","lastName":"Yoda"},{"id":994,"firstName":"Zed","lastName":"Whateveryournameis"},{"id":595,"firstName":"Someone First Name","lastName":"Someone Last Name"},{"id":223,"firstName":"Toto","lastName":"Yoda"},{"id":392,"firstName":"Foo","lastName":"Moliku"},{"id":972,"firstName":"Toto","lastName":"Whateveryournameis"},{"id":155,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":956,"firstName":"Louis","lastName":"Yoda"},{"id":62,"firstName":"Foo","lastName":"Kyle"},{"id":689,"firstName":"Superman","lastName":"Titi"},{"id":46,"firstName":"Foo","lastName":"Someone Last Name"},{"id":401,"firstName":"Toto","lastName":"Someone Last Name"},{"id":658,"firstName":"Louis","lastName":"Bar"},{"id":375,"firstName":"Someone First Name","lastName":"Bar"},{"id":877,"firstName":"Toto","lastName":"Someone Last Name"},{"id":923,"firstName":"Cartman","lastName":"Lara"},{"id":37,"firstName":"Zed","lastName":"Kyle"},{"id":416,"firstName":"Cartman","lastName":"Yoda"},{"id":546,"firstName":"Zed","lastName":"Yoda"},{"id":282,"firstName":"Luke","lastName":"Lara"},{"id":943,"firstName":"Superman","lastName":"Yoda"},{"id":319,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":390,"firstName":"Louis","lastName":"Lara"},{"id":556,"firstName":"Luke","lastName":"Kyle"},{"id":255,"firstName":"Cartman","lastName":"Whateveryournameis"},{"id":80,"firstName":"Zed","lastName":"Kyle"},{"id":760,"firstName":"Louis","lastName":"Moliku"},{"id":291,"firstName":"Louis","lastName":"Titi"},{"id":916,"firstName":"Louis","lastName":"Bar"},{"id":212,"firstName":"Foo","lastName":"Moliku"},{"id":445,"firstName":"Luke","lastName":"Whateveryournameis"},{"id":101,"firstName":"Someone First Name","lastName":"Someone Last Name"},{"id":565,"firstName":"Superman","lastName":"Kyle"},{"id":304,"firstName":"Luke","lastName":"Someone Last Name"},{"id":557,"firstName":"Foo","lastName":"Titi"},{"id":544,"firstName":"Toto","lastName":"Kyle"},{"id":244,"firstName":"Zed","lastName":"Titi"},{"id":464,"firstName":"Someone First Name","lastName":"Bar"},{"id":225,"firstName":"Toto","lastName":"Titi"},{"id":727,"firstName":"Superman","lastName":"Someone Last Name"},{"id":735,"firstName":"Louis","lastName":"Bar"},{"id":334,"firstName":"Foo","lastName":"Lara"},{"id":982,"firstName":"Batman","lastName":"Kyle"},{"id":48,"firstName":"Batman","lastName":"Lara"},{"id":175,"firstName":"Luke","lastName":"Moliku"},{"id":885,"firstName":"Louis","lastName":"Moliku"},{"id":675,"firstName":"Toto","lastName":"Moliku"},{"id":47,"firstName":"Superman","lastName":"Someone Last Name"},{"id":105,"firstName":"Toto","lastName":"Titi"},{"id":616,"firstName":"Cartman","lastName":"Lara"},{"id":134,"firstName":"Someone First Name","lastName":"Someone Last Name"},{"id":26,"firstName":"Foo","lastName":"Moliku"},{"id":134,"firstName":"Toto","lastName":"Whateveryournameis"},{"id":680,"firstName":"Zed","lastName":"Lara"},{"id":208,"firstName":"Luke","lastName":"Someone Last Name"},{"id":233,"firstName":"Someone First Name","lastName":"Moliku"},{"id":131,"firstName":"Louis","lastName":"Moliku"},{"id":87,"firstName":"Toto","lastName":"Yoda"},{"id":356,"firstName":"Batman","lastName":"Kyle"},{"id":39,"firstName":"Louis","lastName":"Whateveryournameis"},{"id":867,"firstName":"Batman","lastName":"Lara"},{"id":382,"firstName":"Someone First Name","lastName":"Bar"}];
  $scope.items = [{"id":860,"firstName":"Superman","lastName":"Yoda"},{"id":870,"firstName":"Foo","lastName":"Whateveryournameis"},{"id":590,"firstName":"Toto","lastName":"Titi"},{"id":803,"firstName":"Luke","lastName":"Kyle"},{"id":474,"firstName":"Toto","lastName":"Bar"},{"id":476,"firstName":"Zed","lastName":"Kyle"},{"id":464,"firstName":"Cartman","lastName":"Kyle"},{"id":505,"firstName":"Superman","lastName":"Yoda"},{"id":308,"firstName":"Louis","lastName":"Kyle"}];
  var currentIndex = 8;
  var offset = 8;
  $scope.ddate = Date;
  $scope.loadMore = function() {
    /*$scope.items = $scope.items.concat(allItems.slice(currentIndex,currentIndex+offset));
    currentIndex = currentIndex + offset;*/
  };
  $scope.toggleDropdown = function(event,index,t_item){
    debugger;
  };

  $scope.tableStatus = true;
  var dialogOptions = {
    controller: 'EditCtrl',
    templateUrl: 'itemEdit.html'
  };


  $scope.status = {
    isopen: false
  };
  
  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };

  $scope.edit = function(item){
    /*
    var itemToEdit = item;
    
    $dialog.dialog(angular.extend(dialogOptions, {resolve: {item: angular.copy(itemToEdit)}}))
      .open()
      .then(function(result) {
        if(result) {
          angular.copy(result, itemToEdit);                
        }
        itemToEdit = undefined;
      });*/
};
}
// the dialog is injected in the specified controller
function EditCtrl($scope, item, dialog){

  $scope.item = item;
  
  $scope.save = function() {
    dialog.close($scope.item);
  };
  
  $scope.close = function(){
    dialog.close(undefined);
  };
}

