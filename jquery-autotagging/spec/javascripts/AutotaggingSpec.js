describe("Autotagging Suite", function() {
  var wh, simulPlatform, testWindow;

  beforeEach(function() {
    var ready = false;

    require(['../../jquery.autotagging'], function(WH) {
      wh = new WH();
      wh.platform = {OS: 'OS', browser: 'dummy', version: ''};
      testWindow = $('<div></div>');
      ready = true;
    });

    waitsFor(function(){
      return ready;
    });
  });

  describe("Instance Methods", function() {
    it('#determineWindowDimensions returns a string for window dimensions', function() {
      testWindow.width(100).height(100);
      expect(wh.determineWindowDimensions(testWindow)).toEqual('100x100');
    });

    it('#determineWindowDimensions returns a string for document dimensions', function() {
      testWindow.width(100).height(100);
      expect(wh.determineWindowDimensions(testWindow)).toEqual('100x100');
    });

    describe("#fire", function() {
      var callback;
      var obj = {};

      beforeEach(function() {
        callback = {
          fightFire: function(obj) {
            obj.blaze = true;
            return obj;
          }
        };

        wh.fireCallback = callback.fightFire;
        spyOn(wh, 'fireCallback').andCallThrough();
      });

      it('calls the given callback', function () {
        wh.fire(obj);
        expect(obj.blaze).toEqual(true);
        expect(wh.fireCallback).toHaveBeenCalled();
      });

      it('amends the object with the one time data ONCE', function() {
        wh.setOneTimeData({auxiliary: 'secret'});
        wh.fire(obj);
        expect(obj.auxiliary).toEqual('secret');

        next = {};
        wh.fire(next);
        expect(next.auxiliary).toEqual(undefined);
      });

      describe('records login information', function() {
        var signon_cookie;
        var provider_cookie;
        var zid_cookie;

        beforeEach(function() {
          provider_cookie = $.cookie('provider');
          signon_cookie   = $.cookie('sgn');
          zid_cookie      = $.cookie('zid');
        });

        afterEach(function() {
          $.cookie('provider', provider_cookie, {expires: 3650, path: '/'});
          $.cookie('sgn', signon_cookie, {expires: 3650, path: '/'});
          $.cookie('zid', zid_cookie, {expires: 3650, path: '/'});
        });

        it('returns "0" if not registered', function() {
          $.cookie('sgn', 0, {expires: 3650, path: '/'});
          wh.fire(obj);
          expect(obj.registration).toEqual(0);
        });

        it('returns "1" if registered', function() {
          $.cookie('sgn', 1, {expires: 3650, path: '/'});
          wh.fire(obj);
          expect(obj.registration).toEqual(1);
        });
      });

      it('sets the firing time', function () {
        wh.fire(obj);
        expect(obj.ft).toNotEqual(undefined);
      });
    });

    it ('firedTime returns the current time in epoch seconds', function() {
      now = new Date().getTime();
      expect(wh.firedTime()).toEqual(now);
    });

    it('#firstClass yields the first class name of the element', function() {
      testElement = $("<div class='first second third'></div>");
      expect(wh.firstClass(testElement)).toEqual('first');
    });

    it('#getDataFromMetaTags extracts WH meta tags', function() {
      testDoc = $("<div><meta name='WH.test' content='dummy'/><meta name='WH.quiz' content='placeholder'</div>");
      result = { cg : '', test : 'dummy', quiz : 'placeholder' };
      expect(wh.getDataFromMetaTags(testDoc)).toEqual(result);
    });

    describe("#elemClicked", function() {
      var newContent;
      var targets;

      beforeEach(function() {
        newContent = $("<div><a class='link' href='#to_the_past'>Z</a></div>");
        targets = 'a.link';
        wh.init({followHref: true});
        wh.clickBindSelector = targets;
        wh.bindBodyClicked(newContent);
        spyOn(wh, 'elemClicked');
      });

      it('should read a followHref of true by default', function() {
        expect(wh.followHref).toEqual(true);
      });

      it('saves the last link clicked', function() {
        newContent.find('a.link').click();
        expect(wh.lastLinkClicked).toEqual("#to_the_past");
        expect(wh.elemClicked).toHaveBeenCalled();
      });
    });

    describe("#init", function() {
      var newContent;
      var targets;

      beforeEach(function() {
        newContent = $("<div><a class='trap' href='#'>O</a><a class='x' href='#'>O</a></div>");
        targets = 'a.trap';
        wh.clickBindSelector = targets;
        wh.bindBodyClicked(newContent);
        spyOn(wh, 'fire');
      });

      it('binds to the named elements', function() {
        newContent.find('a.trap').click();
        expect(wh.fire).toHaveBeenCalled();
      });

      it('does not bind to other elements', function() {
        newContent.find('a.x').click();
        expect(wh.fire).not.toHaveBeenCalled();
      });
    });

    it('#setOneTimeData records attributes', function() {
      once = {a: 'Apple', b: 'Banana'};
      wh.setOneTimeData(once);
      data = wh.getOneTimeData();
      expect(data.a).toEqual('Apple');
      expect(data.b).toEqual('Banana');
    });
  });
});
