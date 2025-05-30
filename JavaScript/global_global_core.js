;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.2fa', {
        initialize: function() {
            this.on('tabShown', this.tabShown);
            this.on('tabChanged', this.tabChanged);
            this.setup();
        },
        setup: function() {
            this.scope.css({
                zIndex: ips.ui.zIndex()
            });
            this.scope.find('input[type="text"]:visible').first().focus();
        },
        tabShown: function(e, data) {
            this.scope.find('input[type="text"]:visible').first().focus();
        },
        tabChanged: function(e, data) {
            if (data.tab) {
                data.tab.find('input[name="mfa_method"]').prop('checked', true);
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.authyOneTouch', {
        initialize: function() {
            var scope = $(this.scope);
            setInterval(function() {
                ips.getAjax()(scope.closest('form').attr('action'), {
                    data: {
                        'onetouchCheck': scope.find('[data-role="onetouchCode"]').val()
                    }
                }).done(function(response) {
                    if (response.status == 1) {
                        scope.closest('form').submit();
                    }
                });
            }, 3000);
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.coverPhoto', {
        _image: null,
        _repositioning: false,
        _existingPosition: 0,
        _tooltip: null,
        _expandedCover: false,
        _containerHeight: 0,
        initialize: function() {
            var self = this;
            this.on('menuItemSelected', function(e, data) {
                switch ($(data.originalEvent.target).attr('data-action')) {
                case 'removeCoverPhoto':
                    self.removePhoto(data);
                    break;
                case 'positionCoverPhoto':
                    self.positionPhoto(data.originalEvent);
                    break;
                }
            });
            this.on('click', '[data-action="savePosition"]', this.savePosition);
            this.on('click', '[data-action="cancelPosition"]', this.cancelPosition);
            $(window).on('resize', _.bind(this.resizeWindow, this));
            this.on('click', '[data-action="toggleCoverPhoto"]', this.toggleCoverPhoto);
            this.setup();
        },
        setup: function() {
            this._initCoverPhotoImage();
            this._containerHeight = this.scope.outerHeight();
            if (this.scope.closest('.cWidgetContainer').length) {
                $('#elEditPhoto').hide();
            }
            var doPosition = ips.utils.url.getParam('_position');
            if (!_.isUndefined(doPosition)) {
                this.positionPhoto();
            }
            this.scope.find('a[data-action="positionCoverPhoto"]').parent().removeClass('ipsHide');
        },
        _initCoverPhotoImage: function() {
            var self = this;
            this._image = this.scope.find('.ipsCoverPhoto_photo');
            this._offset = this.scope.attr('data-coverOffset') || 0;
            if (!this._image.attr('data-positioned')) {
                this._image.css({
                    opacity: "0.0001"
                });
            }
            if (this._image.length) {
                var position = _.bind(this._positionImage, self);
                if (this._image.is('[data-src]') && !this._image.is('[data-loaded]')) {
                    ips.utils.lazyLoad.observe(this.scope.find('.ipsCoverPhoto_photo'), {
                        imgLoadedCallback: function() {
                            position();
                        }
                    });
                } else {
                    this._image.imagesLoaded(position);
                }
            }
        },
        resizeWindow: function() {
            if (this._expandedCover) {
                this.toggleCoverPhoto();
            }
            this._initCoverPhotoImage();
        },
        removePhoto: function(data) {
            data.originalEvent.preventDefault();
            var self = this;
            ips.ui.alert.show({
                type: 'confirm',
                icon: 'warn',
                message: ips.getString('confirmRemoveCover'),
                callbacks: {
                    ok: function() {
                        ips.getAjax()($(data.originalEvent.target).attr('href') + '&wasConfirmed=1').done(function() {
                            ips.utils.anim.go('fadeOut', self._image).done(function() {
                                ips.ui.flashMsg.show(ips.getString('removeCoverDone'));
                            });
                            data.menuElem.find('[data-role="photoEditOption"]').hide();
                        }).fail(function(err) {
                            window.location = $(data.originalEvent.target).attr('href');
                        });
                    }
                }
            });
        },
        savePosition: function(e) {
            e.preventDefault();
            var natHeight = ips.utils.position.naturalHeight(this._image);
            var realHeight = this._image.outerHeight();
            var topPos = parseInt(this._image.css('top')) * -1;
            var percentage = (topPos / realHeight) * 100;
            var newOffset = Math.floor((natHeight / 100) * percentage);
            this._offset = newOffset;
            this.scope.attr('data-coverOffset', newOffset);
            ips.getAjax()(this.scope.attr('data-url') + '&do=coverPhotoPosition' + '&offset=' + newOffset).fail(function(err) {
                this.scope.attr('data-url') + '&do=coverPhotoPosition' + '&offset=' + newOffset;
            });
            this._resetImage();
        },
        cancelPosition: function(e) {
            e.preventDefault();
            this._image.css({
                top: this._existingPosition + 'px',
            });
            this._resetImage();
        },
        positionPhoto: function(e) {
            if (!_.isUndefined(e)) {
                e.preventDefault();
            }
            var self = this;
            this.scope.find('[data-hideOnCoverEdit]').css({
                visibility: 'hidden'
            });
            this._image.css({
                cursor: 'move'
            });
            this._repositioning = true;
            this._existingPosition = parseInt(this._image.css('top')) || 0;
            this.scope.find('.ipsCoverPhoto_container').append(ips.templates.render('core.coverPhoto.controls'));
            this._showTooltip();
            ips.loader.get(['core/interface/jquery/jquery-ui.js']).then(function() {
                self._image.draggable({
                    axis: 'y',
                    scroll: false,
                    stop: _.bind(self._dragStop, self)
                });
            });
        },
        _positionImage: function() {
            if (!this._image.length) {
                return;
            }
            var natHeight = ips.utils.position.naturalHeight(this._image);
            var realHeight = this._image.outerHeight();
            if (this._offset === 0) {
                this._image.animate({
                    opacity: "1"
                }, 'fast');
                return;
            }
            var percentage = ((this._offset * 1) / natHeight) * 100;
            var adjustedOffset = (Math.floor((realHeight / 100) * percentage) * -1);
            var minBottom = (realHeight - this.scope.outerHeight()) * -1;
            if (adjustedOffset < minBottom) {
                adjustedOffset = minBottom;
            }
            this._image.attr('data-positioned', true).css({
                position: 'absolute',
                left: "0",
                top: adjustedOffset + 'px',
            }).animate({
                opacity: "1"
            }, 'fast');
        },
        _resetImage: function() {
            if (this._image.draggable) {
                this._image.draggable('destroy');
            }
            this._image.css({
                cursor: 'default'
            });
            this.scope.find('.ipsCoverPhoto_container [data-role="coverPhotoControls"]').remove();
            this.scope.find('[data-hideOnCoverEdit]').css({
                visibility: 'visible'
            });
            this._hideTooltip();
            ips.utils.history.pushState({}, 'core.global.core.coverPhoto', ips.utils.url.removeParam('csrfKey', this.scope.attr('data-url')));
        },
        _showTooltip: function(msg) {
            if (!this._tooltip) {
                this._buildTooltip();
            }
            this._tooltip.hide().text(ips.getString('dragCoverPhoto'));
            this._positionTooltip();
        },
        _hideTooltip: function() {
            if (this._tooltip && this._tooltip.is(':visible')) {
                ips.utils.anim.go('fadeOut', this._tooltip);
            }
        },
        _positionTooltip: function() {
            var positionInfo = {
                trigger: this.scope.find('.ipsCoverPhoto_container'),
                target: this._tooltip,
                center: true,
                above: true
            };
            var tooltipPosition = ips.utils.position.positionElem(positionInfo);
            this._tooltip.css({
                left: tooltipPosition.left + 'px',
                top: tooltipPosition.top + 'px',
                position: (tooltipPosition.fixed) ? 'fixed' : 'absolute',
                zIndex: ips.ui.zIndex()
            });
            if (tooltipPosition.location.vertical == 'top') {
                this._tooltip.addClass('ipsTooltip_top');
            } else {
                this._tooltip.addClass('ipsTooltip_bottom');
            }
            this._tooltip.show();
        },
        _buildTooltip: function() {
            var tooltipHTML = ips.templates.render('core.tooltip', {
                id: 'elCoverPhotoTooltip'
            });
            ips.getContainer().append(tooltipHTML);
            this._tooltip = $('#elCoverPhotoTooltip');
        },
        _dragStop: function() {
            var imageTop = parseInt(this._image.css('top'));
            if (imageTop > 0) {
                this._image.css({
                    top: "0",
                    bottom: 'auto',
                    position: 'absolute'
                });
            } else {
                var containerHeight = this.scope.find('.ipsCoverPhoto_container').outerHeight();
                var imageHeight = this._image.outerHeight();
                if ((imageTop + imageHeight) < containerHeight) {
                    this._image.css({
                        top: 'auto',
                        bottom: "0",
                        position: 'absolute'
                    });
                }
            }
        },
        toggleCoverPhoto: function() {
            var imageHeight = this._image.outerHeight();
            if (this._expandedCover == false) {
                this._existingPosition = parseInt(this._image.css('top')) || 0;
                this.scope.animate({
                    height: (imageHeight + this._existingPosition) + 'px',
                });
                this._expandedCover = true;
            } else {
                this.scope.animate({
                    height: this._containerHeight + 'px'
                });
                this._expandedCover = false;
            }
            this.scope.toggleClass('ipsCoverPhotoMinimal');
        },
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.cropper', {
        _image: null,
        _coords: {},
        initialize: function() {
            this.setup();
        },
        setup: function() {
            var self = this;
            this._image = this.scope.find('[data-role="profilePhoto"]');
            this._coords = {
                topLeftX: this.scope.find('[data-role="topLeftX"]'),
                topLeftY: this.scope.find('[data-role="topLeftY"]'),
                bottomRightX: this.scope.find('[data-role="bottomRightX"]'),
                bottomRightY: this.scope.find('[data-role="bottomRightY"]'),
            };
            this._image.css({
                maxWidth: '100%'
            });
            ips.loader.get(['core/interface/cropper/cropper.min.js']).then(function() {
                self._image.imagesLoaded(_.bind(self._startCropper, self));
            });
        },
        _startCropper: function() {
            var self = this;
            var width = this._image.width();
            var height = this._image.height();
            this._image.closest('[data-role="cropper"]').css({
                width: width + 'px',
                height: height + 'px'
            });
            var cropper = new Cropper(this._image.get(0),{
                aspectRatio: 1 / 1,
                autoCropArea: 0.9,
                responsive: true,
                zoomOnWheel: false,
                crop: function(e) {
                    self._coords.topLeftX.val(e.detail.x);
                    self._coords.topLeftY.val(e.detail.y);
                    self._coords.bottomRightX.val(e.detail.width + e.detail.x);
                    self._coords.bottomRightY.val(e.detail.height + e.detail.y);
                }
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.datetime', {
        initialize: function() {
            this.setup();
        },
        setup: function() {
            var formatObject = {
                format: $(this.scope).attr('data-format')
            };
            var localeTimeFormat = ips.utils.time.localeTimeFormat($('html').attr('lang'));
            if (localeTimeFormat.meridiem) {
                formatObject.meridiem = localeTimeFormat.meridiem;
            }
            $(this.scope).text(ips.utils.time.formatTime(new Date($(this.scope).attr('data-time')), formatObject));
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.embeddedvideo', {
        initialize: function() {
            var video = this.scope.get(0);
            var canPlay = false;
            this.scope.find('source').each(function() {
                if (video.canPlayType($(this).attr('type'))) {
                    canPlay = true;
                }
            });
            if (!canPlay) {
                if (this.scope.find('embed').length) {
                    this.scope.replaceWith(this.scope.find('embed'));
                } else {
                    this.scope.replaceWith($(this.scope).find('a'));
                }
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.framebust', {
        initialize: function() {
            if (top != self) {
                $(this.scope).html('');
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.genericTable', {
        _curSearchValue: '',
        _urlParams: {},
        _baseURL: '',
        _searchField: null,
        _timer: null,
        _currentValue: '',
        initialize: function() {
            this.on('paginationClicked paginationJump', this.paginationClicked);
            this.on('click', '[data-action="tableFilter"]', this.changeFiltering);
            this.on('menuItemSelected', '[data-role="tableFilterMenu"]', this.changeFilteringFromMenu);
            this.on('focus', '[data-role="tableSearch"]', this.startLiveSearch);
            this.on('blur', '[data-role="tableSearch"]', this.endLiveSearch);
            this.on('click', '[data-action="tableSort"]', this.changeSorting);
            this.on('menuItemSelected', '#elSortMenu', this.sortByMenu);
            this.on('menuItemSelected', '#elOrderMenu', this.orderByMenu);
            this.on('refreshResults', this._getResults);
            this.on('buttonAction', this.buttonAction);
            this.on(window, 'historychange:core.global.core.genericTable', this.stateChange);
            this.setup();
        },
        setup: function() {
            this._baseURL = this.scope.attr('data-baseurl');
            if (this.scope.attr('data-baseurl').match(/\?/)) {
                this._baseURL += '&';
            } else {
                this._baseURL += '?';
            }
            this._searchField = this.scope.find('[data-role="tableSearch"]');
            var sort = this._getSortValue();
            this._urlParams = {
                filter: this._getFilterValue() || '',
                sortby: sort.by || '',
                sortdirection: sort.order || '',
                quicksearch: this._getSearchValue() || '',
                page: ips.utils.url.getParam('page') || 1
            };
            ips.utils.history.replaceState(this._urlParams, 'core.global.core.genericTable', window.location.href);
            this.scope.find('[data-role="tableSearch"]').removeClass('ipsHide').show();
        },
        buttonAction: function(e, data) {
            this._getResults();
        },
        sortByMenu: function(e, data) {
            data.originalEvent.preventDefault();
            this._updateSort({
                by: data.selectedItemID
            });
        },
        orderByMenu: function(e, data) {
            data.originalEvent.preventDefault();
            this._updateSort({
                order: data.selectedItemID
            });
        },
        stateChange: function() {
            const state = {
                data: ips.utils.history.getState('core.global.core.genericTable'),
                url: window.location.href
            };
            if (state.data?.controller !== 'genericTable') {
                return;
            }
            if (!_.isUndefined(state.data.filter) && state.data.filter !== this._urlParams.filter) {
                this._updateFilter(state.data.filter);
            }
            if ((!_.isUndefined(state.data.sortby) && !_.isUndefined(state.data.sortdirection)) && (state.data.sortby !== this._urlParams.sortby || state.data.sortdirection !== this._urlParams.sortdirection)) {
                this._updateSort({
                    by: state.data.sortby,
                    order: state.data.sortdirection
                });
            }
            if (!_.isUndefined(state.data.quicksearch) && state.data.quicksearch !== this._urlParams.quicksearch) {
                this._updateSearch(state.data.quicksearch);
            }
            if (!_.isUndefined(state.data.page) && state.data.page !== this._urlParams.page) {
                this._updatePage(state.data.page);
            }
            this._urlParams = state.data;
            this._getResults();
        },
        updateURL: function(newParams) {
            _.extend(this._urlParams, newParams);
            const tmpStateData = _.extend(_.clone(this._urlParams), {
                controller: 'genericTable'
            });
            const newUrlParams = this._getURL();
            if (newUrlParams.match(/page=\d/)) {
                this._baseURL = this._baseURL.replace(/page=\d+?(&|\s)/, '');
            }
            let newUrl = this._baseURL + newUrlParams;
            if (newUrl.endsWith('?')) {
                newUrl = newUrl.substring(0, newUrl.length - 1);
            }
            ips.utils.history.pushState(tmpStateData, 'core.global.core.genericTable', newUrl);
        },
        _getURL: function() {
            var tmpUrlParams = {};
            for (var i in this._urlParams) {
                if (this._urlParams[i] != '' && i != 'controller' && (i != 'page' || (i == 'page' && this._urlParams[i] != 1))) {
                    tmpUrlParams[i] = this._urlParams[i];
                }
            }
            return $.param(tmpUrlParams);
        },
        paginationClicked: function(e, data) {
            if (data.originalEvent) {
                data.originalEvent.preventDefault();
            }
            if (data.pageNo != this._urlParams.page) {
                this.updateURL({
                    page: data.pageNo
                });
            }
        },
        _updatePage: function(newPage) {
            this.scope.find('[data-role="tablePagination"] [data-page]').removeClass('ipsPagination_pageActive').end().find('[data-page="' + newPage + '"]').addClass('ipsPagination_pageActive');
        },
        changeFiltering: function(e) {
            e.preventDefault();
            var newFilter = $(e.currentTarget).attr('data-filter');
            this._updateFilter(newFilter);
            if (newFilter != this._urlParams.filter) {
                this.updateURL({
                    filter: newFilter,
                    page: 1
                });
            }
        },
        changeFilteringFromMenu: function(e, data) {
            var newFilter = $(data.originalEvent.target).closest('li').attr('data-filter');
            this._updateFilter(newFilter);
            if (newFilter != this._urlParams.filter) {
                this.updateURL({
                    filter: newFilter,
                    page: 1
                });
            }
        },
        _updateFilter: function(newFilter) {
            this.scope.find('[data-role="tableSortBar"] [data-action="tableFilter"] a').removeClass('ipsButtonRow_active').end().find('[data-action="tableFilter"][data-filter="' + newFilter + '"] a').addClass('ipsButtonRow_active');
        },
        startLiveSearch: function(e) {
            this._timer = setInterval(_.bind(this._checkSearchValue, this), 500);
        },
        endLiveSearch: function(e) {
            clearInterval(this._timer);
        },
        _checkSearchValue: function() {
            var val = this._searchField.val();
            if (this._currentValue != val) {
                this.updateURL({
                    quicksearch: val,
                    page: 1
                });
                this._currentValue = val;
            }
        },
        _updateSearch: function(searchValue) {
            this._searchField.val(searchValue);
        },
        changeSorting: function(e) {
            e.preventDefault();
            var cell = $(e.currentTarget);
            var order = '';
            if (cell.hasClass('ipsTable_sortableActive')) {
                order = (cell.hasClass('ipsTable_sortableDesc')) ? 'asc' : 'desc';
            } else {
                order = (cell.hasClass('ipsTable_sortableDesc')) ? 'desc' : 'asc';
            }
            this._updateSort({
                by: cell.attr('data-key'),
                order: order
            });
        },
        _updateSort: function(data) {
            var directions = 'ipsTable_sortableAsc ipsTable_sortableDesc';
            var current = this._getSortValue();
            if (!data.by) {
                data.by = current.by;
            }
            if (!data.order) {
                data.order = current.order;
            }
            this.scope.find('[data-role="table"] [data-action="tableSort"]').removeClass('ipsTable_sortableActive').removeAttr('aria-sort').end().find('[data-action="tableSort"][data-key="' + data.by + '"]').addClass('ipsTable_sortableActive').removeClass(directions).addClass('ipsTable_sortable' + data.order.charAt(0).toUpperCase() + data.order.slice(1)).attr('aria-sort', (data.order == 'asc') ? 'ascending' : 'descending');
            $('#elSortMenu_menu, #elOrderMenu_menu').find('.ipsMenu_item').removeClass('ipsMenu_itemChecked').end().find('[data-ipsMenuValue="' + data.by + '"], [data-ipsMenuValue="' + data.order + '"]').addClass('ipsMenu_itemChecked');
            this.updateURL({
                sortby: data.by,
                sortdirection: data.order,
                page: 1
            });
        },
        _getResults: function() {
            var self = this;
            ips.getAjax()(this._baseURL + this._getURL() + '&' + this.scope.attr('data-resort') + '=1', {
                dataType: 'json',
                showLoading: true
            }).done(function(response) {
                self._updateTable(response);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                if (Debug.isEnabled()) {
                    Debug.error("Ajax request failed (" + status + "): " + errorThrown);
                    Debug.error(jqXHR.responseText);
                } else {
                    window.location = self._baseURL + self._getURL();
                }
            });
        },
        _updateTable: function(response) {
            this.scope.find('[data-role="tableRows"]').html(response.rows);
            this.scope.find('[data-role="tablePagination"]').toggle((response.pagination && response.pagination.trim() !== "") || !_.isUndefined(this.scope.find('[data-role="tablePagination"]').attr('data-showEmpty'))).html(response.pagination || "");
            $(document).trigger('contentChange', [this.scope]);
        },
        _getFilterValue: function() {
            var sortBar = this.scope.find('[data-role="tableSortBar"]');
            if (!sortBar.length) {
                return '';
            }
            return sortBar.find('.ipsButtonRow_active').closest('[data-filter]').attr('data-filter');
        },
        _getSortValue: function() {
            var sortBy = this.scope.find('[data-role="table"] thead .ipsTable_sortable.ipsTable_sortableActive');
            var sortOrder = 'desc';
            if (sortBy.hasClass('ipsTable_sortableAsc')) {
                sortOrder = 'asc';
            }
            return {
                by: sortBy.attr('data-key'),
                order: sortOrder
            };
        },
        _getSearchValue: function() {
            if (ips.utils.url.getParam('quicksearch')) {
                return ips.utils.url.getParam('quicksearch');
            }
            return this.scope.find('[data-role="tableSearch"]').val();
        },
        _actionReplace: function(target, contents) {
            var tr = $(target).closest('tr');
            var prevElem = tr.prev();
            tr.replaceWith(contents);
            $(document).trigger('contentChange', [prevElem.next()]);
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.googleAuth', {
        initialize: function() {
            this.on('click', '[data-action="showManual"]', this.showManual);
            this.on('click', '[data-action="showBarcode"]', this.showBarcode);
            var waitUntil = $(this.scope).attr('data-waitUntil');
            if (waitUntil > Math.floor(Date.now() / 1000)) {
                this.showWait();
            }
        },
        showManual: function() {
            this.scope.find('[data-role="barcode"]').hide();
            this.scope.find('[data-role="manual"]').show();
        },
        showBarcode: function() {
            this.scope.find('[data-role="barcode"]').show();
            this.scope.find('[data-role="manual"]').hide();
        },
        showWait: function() {
            this.scope.find('[data-role="codeWaiting"]').show();
            this.scope.find('[data-role="codeInput"]').hide();
            var waitUntil = $(this.scope).attr('data-waitUntil') * 1000;
            var start = Date.now();
            var progressBar = $(this.scope).find('[data-role="codeWaitingProgress"]');
            var interval = setInterval(function() {
                if (Date.now() >= waitUntil) {
                    clearInterval(interval);
                    this.showInput();
                }
                progressBar.css('width', ((100 - (100 / (waitUntil - start) * (waitUntil - Date.now())))) + '%');
            }
            .bind(this), 100);
        },
        showInput: function() {
            this.scope.find('[data-role="codeWaiting"]').hide();
            this.scope.find('[data-role="codeInput"]').show();
            this.scope.find('input').focus();
        }
    });
}(jQuery, _));
;;(function($, _) {
    "use strict";
    ips.controller.register('ips.core.map.googlemap', {
        initialize() {
            let mapData = this.scope.data().mapData;
            if (typeof mapData === 'string') {
                mapData = JSON.parse(mapData);
            }
            if ('key'in mapData) {
                this._mapData = mapData;
                ips.ui.map.afterGoogleMapsLoaded( () => this.setupGoogleMaps())
            }
        },
        setupGoogleMaps() {
            let position = {
                lat: this._mapData.lat,
                lng: this._mapData.long
            };
            let elem = this.scope.find('[data-role="mapContainer"]').get(0);
            let maptype = 'ROADMAP';
            if (this._mapData.maptype && window.google.maps.MapTypeId[this._mapData.maptype.toUpperCase()]) {
                maptype = this._mapData.maptype.toUpperCase();
            }
            let map = new window.google.maps.Map(elem,{
                center: position,
                zoom: this._mapData.zoom ? this._mapData.zoom * 8 : 15,
                scale: this._mapData.scale || undefined,
                mapTypeId: window.google.maps.MapTypeId[maptype.toUpperCase()]
            });
            let marker = new window.google.maps.Marker({
                position,
                map
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.licenseRenewal', {
        initialize: function() {
            this.on('click', '[data-action="notNow"]', this.renewalPrompt);
            this.on(document, 'click', '[data-action="closeLicenseRenewal"]', this.close);
        },
        renewalPrompt: function(e) {
            e.preventDefault();
            this._modal = ips.ui.getModal();
            if (!$('body').find('[data-role="licenseRenewal"]').length) {
                $('body').append(ips.templates.render('licenseRenewal.wrapper'));
            }
            this._container = $('body').find('[data-role="licenseRenewal"]').css({
                opacity: "0.001",
                transform: "scale(0.8)"
            });
            $('body').find('[data-role="survey"]').attr('href', $(this.scope).attr('data-surveyUrl'));
            this._modal.css({
                zIndex: ips.ui.zIndex()
            });
            var self = this;
            setTimeout(function() {
                self._container.css({
                    zIndex: ips.ui.zIndex()
                });
                self._container.animate({
                    opacity: "1",
                    transform: "scale(1)"
                }, 'fast');
            }, 500);
            ips.utils.anim.go('fadeIn', this._modal);
        },
        close: function(e) {
            if ($('body').find('[data-role="licenseRenewal"]').find('input[type=checkbox][name=hideRenewalNotice]').is(':checked')) {
                var notification = $(this.scope).closest('.cNotification,.cAcpNotificationBanner');
                ips.getAjax()($(this.scope).find('[data-action="notNow"]').attr('href')).done(function(response) {
                    ips.utils.anim.go('fadeOut', notification);
                    if (!notification.closest('.cNotificationList').children().count) {
                        ips.utils.anim.go('fadeIn', notification.closest('.cNotificationList').find('[data-role="empty"]').removeClass('ipsHide'));
                    }
                    $('body').trigger('updateNotificationCount');
                });
            }
            $('body').find('[data-role="licenseRenewal"]').animate({
                transform: "scale(0.7)",
                opacity: "0"
            }, 'fast');
            ips.utils.anim.go('fadeOut', this._modal);
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.multipleRedirect', {
        _iterator: 0,
        initialize: function() {
            var self = this;
            this.setup();
        },
        setup: function() {
            this.scope.find('.ipsRedirect').removeClass('ipsHide');
            $('.ipsRedirect_manualButton').hide();
            this.step(this.scope.attr('data-url') + '&mr=0&_mrReset=1');
        },
        step: function(url) {
            this._iterator++;
            var elem = this.scope;
            var self = this;
            ips.getAjax()(url).done(function(response) {
                if (_.isObject(response) && response.custom) {
                    var originalContent = $(elem.html()).removeClass('ipsHide');
                    var newContent = elem.html(response.custom);
                    newContent.find('[data-action="redirectContinue"]').click(function(e) {
                        e.preventDefault();
                        elem.html(originalContent);
                        self.step($(this).attr('href'));
                    });
                    $(document).trigger('contentChange', [elem]);
                    return;
                }
                if (_.isObject(response) && response.redirect) {
                    window.location = response.redirect;
                    return;
                }
                elem.find('[data-loading-text]').attr('data-loading-text', response[1]);
                if (response[2] && response[2] < 100) {
                    elem.find('[data-role="progressBarContainer"]').removeClass('ipsHide');
                    elem.find('[data-role="loadingIcon"]').addClass('ipsHide');
                    elem.find('[data-role="progressBar"]').css({
                        width: (response[2] + '%')
                    }).attr('data-progress', +(Math.round(response[2] + "e+2") + "e-2") + '%');
                } else {
                    elem.find('[data-role="progressBarContainer"]').addClass('ipsHide');
                    elem.find('[data-role="loadingIcon"]').removeClass('ipsHide');
                    elem.find('[data-role="progressBar"]').removeAttr('data-progress');
                }
                var newurl = elem.attr('data-url') + '&mr=' + self._iterator;
                if (response.done && response.done == true) {
                    window.location = newurl;
                } else if (response.close && response.close == true) {
                    self.trigger('closeDialog');
                } else {
                    self.step(newurl);
                }
            }).fail(function(err) {
                window.location = url;
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.notificationList', {
        initialize: function() {
            this.on('click', '[data-action="dismiss"]', this.dismiss);
        },
        dismiss: function(e) {
            e.preventDefault();
            var notification = $(e.target).closest('[data-role="notificationBlock"],.cAcpNotificationBanner');
            ips.ui.alert.show({
                type: 'confirm',
                message: ips.getString('acp_notification_hide_confirm'),
                icon: 'question',
                callbacks: {
                    ok: function() {
                        ips.getAjax()(notification.find('[data-action="dismiss"]').attr('href')).done(function(response) {
                            notification.addClass('cNotification_hidden');
                            ips.utils.anim.go('fadeOut', notification).done(function() {
                                if (!notification.closest('.cNotificationList').children('[data-role="notificationBlock"]:not(.cNotification_hidden)').length) {
                                    ips.utils.anim.go('fadeIn', notification.closest('.cNotificationList').find('[data-role="empty"]').removeClass('ipsHide'));
                                }
                            });
                            $('body').trigger('updateNotificationCount');
                        });
                    }
                }
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.optionalAutocomplete', {
        _autoComplete: null,
        _closedTagging: false,
        initialize: function() {
            this.setup();
            this.on('click', '[data-action="showAutocomplete"]', this.showAutocomplete);
        },
        setup: function() {
            this._autoComplete = this.scope.find('[data-ipsAutocomplete]');
            if (!_.isUndefined(this._autoComplete.attr('data-ipsAutocomplete-minimized'))) {
                return;
            }
            var div = $('<div data-role="autoCompleteWrapper" />').html(this.scope.contents()).hide();
            this.scope.html(div);
            this.scope.append(ips.templates.render('core.autocomplete.optional', {
                langString: ips.getString(this._autoComplete.attr('data-ipsAutocomplete-lang'))
            }));
            this.scope.closest('.ipsFieldRow').find('.ipsFieldRow_label').hide();
            if (this._autoComplete.attr('data-ipsAutocomplete-freeChoice') && this._autoComplete.attr('data-ipsAutocomplete-freeChoice') == 'false') {
                this._closedTagging = true;
            }
        },
        showAutocomplete: function(e) {
            if (e) {
                e.preventDefault();
            }
            var self = this;
            var autoCompleteObj = ips.ui.autocomplete.getObj(this._autoComplete);
            this.scope.find('[data-action="showAutocomplete"]').hide();
            this.scope.find('[data-role="autoCompleteWrapper"]').show();
            this.scope.closest('.ipsFieldRow').find('.ipsFieldRow_label').show();
            setTimeout(function() {
                if (self._closedTagging) {
                    self.scope.find('[data-action="addToken"]').click();
                } else {
                    autoCompleteObj.focus();
                }
            }, 100);
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.prefixedAutocomplete', {
        initialize: function() {
            this.setup();
            this.on('autoCompleteReady', this.autoCompleteReady);
            this.on('tokenAdded', this.tokensChanged);
            this.on('tokenDeleted', this.tokensChanged);
            this.on('menuItemSelected', '[data-role="prefixButton"]', this.prefixSelected);
            this.scope.find('[data-ipsAutocomplete]').trigger('reissueReady');
        },
        setup: function() {
            this._prefixRow = this.scope.find('[data-role="prefixRow"]');
            this._prefixValue = this.scope.find('[data-role="prefixValue"]');
            this._prefixButton = this.scope.find('[data-role="prefixButton"]');
            this._prefixMenu = this.scope.find('[data-role="prefixMenu"]');
        },
        autoCompleteReady: function(e, data) {
            var tokens = data.currentValues;
            if (this._prefixValue && tokens.length) {
                this._prefixMenu.html(this._buildTokenList(tokens, this._prefixValue.val()));
                this._prefixButton.find('span').html(this._getPrefixText(_.escape(this._prefixValue.val())));
                this._prefixRow.show();
            }
        },
        tokensChanged: function(e, data) {
            if (data.totalTokens > 0 && !this._prefixRow.is(':visible')) {
                ips.utils.anim.go('fadeIn', this._prefixRow);
            } else if (data.totalTokens === 0 && this._prefixRow.is(':visible')) {
                ips.utils.anim.go('fadeOut', this._prefixRow);
                this._prefixRow.find('input[type="checkbox"]').prop('checked', false);
            }
            if (e && e.type == 'tokenDeleted' && data.token == this._prefixValue.val()) {
                this._prefixButton.find('span').html(ips.getString('selectPrefix'));
                this._prefixValue.val('');
            }
            var value = this._prefixValue.val();
            var list = this._buildTokenList(data.tokenList, value);
            this._prefixMenu.html(list);
        },
        prefixSelected: function(e, data) {
            data.originalEvent.preventDefault();
            var itemValue = (data.selectedItemID == '-') ? '' : data.selectedItemID;
            var selectedText = this._getPrefixText(data.selectedItemID);
            this._prefixButton.find('span').html(selectedText);
            this._prefixValue.val(itemValue);
            this._prefixRow.find('input[type="checkbox"]').prop('checked', true);
        },
        _buildTokenList: function(tokens, value) {
            var output = '';
            output += ips.templates.render('core.menus.menuItem', {
                value: '',
                title: ips.getString('selectedNone'),
                checked: (value == '')
            });
            output += ips.templates.render('core.menus.menuSep');
            $.each(tokens, function(i, item) {
                output += ips.templates.render('core.menus.menuItem', {
                    value: item,
                    title: _.unescape(item),
                    checked: (item == value)
                });
            });
            Debug.log(output);
            return output;
        },
        _getPrefixText: function(prefix) {
            var selectedText = '';
            if (prefix && prefix != '-') {
                selectedText = ips.getString('selectedPrefix', {
                    tag: prefix
                });
            } else {
                selectedText = ips.getString('selectedPrefix', {
                    tag: ips.getString('selectedNone')
                });
            }
            return selectedText;
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.table', {
        _urlParams: {},
        _baseURL: '',
        _otherParams: [],
        _pageParam: 'page',
        _updateURL: true,
        _currentPage: 1,
        _seoPagination: false,
        _initialURL: '',
        _ajax: null,
        initialize: function() {
            this.on('paginationClicked paginationJump', this.paginationClicked);
            this.on('refreshResults', this.refreshResults);
            this.on('buttonAction', this.buttonAction);
            this.on('click', '[data-action="tableFilter"]', this.changeFiltering);
            this.on('menuItemSelected', '[data-role="tableFilterMenu"]', this.changeFilteringFromMenu);
            this.on('click', 'tr[data-tableClickTarget]', this.rowClick);
            this.setup();
        },
        setup: function() {
            if (this.scope.attr('data-pageParam') && this.scope.attr('data-pageParam') != 'page') {
                this._pageParam = this.scope.attr('data-pageParam');
            }
            this._otherParams.push(this._pageParam);
            this._baseURL = this.scope.attr('data-baseurl');
            const safeURL = [...(new TextEncoder()).encode(this.scope.attr('data-baseurl') ? ips.utils.url.pageParamToPath(this._cleanUpURL(this.scope.attr('data-baseurl')), this._pageParam, 1) : '')].map(char => String.fromCodePoint(char)).join('');
            this._stateKey = `table${btoa(safeURL)}`;
            this._originalBaseURL = this._baseURL;
            this._currentPage = ips.utils.url.getPageNumber(this._pageParam, window.location.href);
            this._cleanUpBaseURL();
            if (this._baseURL.match(/\?/)) {
                if (this._baseURL.slice(-1) != '?') {
                    this._baseURL += '&';
                }
            } else {
                this._baseURL += '?';
            }
            this._urlParams = this._getUrlParams();
            this._urlParams[this._pageParam] = parseInt(this._currentPage);
            this._initialURL = window.location.href;
            if (this.scope.closest('[data-disableTableUpdates]').length) {
                this._updateURL = false;
            }
            if (!(this._stateKey in ips.utils.history.getState())) {
                ips.utils.history.replaceState({
                    ...this._urlParams,
                    controller: this.controllerID
                }, this._stateKey, window.location.href);
            }
            this.on(window, `historychange:${this._stateKey}`, this.stateChange);
            try {
                if (IpsDataLayerConfig && !window.IpsDataLayerConfig) {
                    this.scope.find('[data-role="tablePagination"] [data-page]').click(function(e) {
                        let target = e.currentTarget;
                        if (target.parentNode.classList.contains('ipsPagination_active')) {
                            return;
                        }
                        let page = Number(e.currentTarget.dataset['page']);
                        if (isNaN(page))
                            return;
                        $('body').trigger('ipsDataLayerProperties', {
                            _properties: {
                                page_number: page
                            }
                        });
                    });
                }
            } catch (e) {}
        },
        stateChange(e) {
            if (e.detail?.type === 'replace') {
                return
            }
            const data = {
                ...this._urlParams,
                ...(ips.utils.history.getState(this._stateKey) || {})
            }
            if (!Object.keys(this._filterParamsForChanges(data)).length) {
                return;
            }
            e.stopImmediatePropagation?.()
            e.stopPropagation?.()
            this._handleStateChanges({
                data,
                url: window.location.href,
                title: document.title
            });
            this._urlParams = {
                ...data
            }
            delete this._urlParams.bypassStateAdjustment
            if (data.bypassStateAdjustment) {
                return;
            }
            this._getResults();
        },
        buttonAction: function() {
            this._getResults();
        },
        refreshResults: function() {
            this._getResults();
        },
        _filterParamsForChanges(params) {
            const out = {};
            for (const k in params) {
                if (['controller'].includes(k)) {
                    continue
                }
                if (!(params[k] || this._urlParams[k])) {
                    continue;
                }
                if (k === this._pageParam && parseInt(params[k]) !== parseInt(this._urlParams[k])) {
                    out[this._pageParam] = parseInt(params[k])
                } else if (params[k] != this._urlParams[k]) {
                    out[k] = params[k]
                }
            }
            return out;
        },
        updateURL(newParams) {
            newParams = this._filterParamsForChanges(newParams)
            if (!Object.keys(newParams).length) {
                return;
            }
            const tmpStateData = {
                ...this._urlParams,
                ...newParams,
                controller: this.controllerID
            };
            let newUrl = (this._baseURL + this._getURL(tmpStateData)).replace(/^([^?]*)?$/, '$1').replace(/&$/, '');
            if (this._seoPagination) {
                newUrl = ips.utils.url.pageParamToPath(newUrl, this._pageParam, newParams[this._pageParam]);
            }
            ips.utils.history.pushState(tmpStateData, this._stateKey, newUrl);
        },
        paginationClicked(e, data) {
            e.stopPropagation?.();
            e.stopImmediatePropagation?.();
            data.originalEvent?.preventDefault()
            this._seoPagination = data.seoPagination;
            this.updateURL({
                [this._pageParam]: parseInt(data.pageNo)
            });
        },
        changeFiltering(e) {
            e.preventDefault();
            this.updateURL({
                filter: $(e.currentTarget).attr('data-filter'),
                [this._pageParam]: 1
            });
        },
        _updateFilter(newFilter) {},
        _updateSort(data) {},
        _updatePage(newPage) {
            const boundingBox = this.scope.get(0).getBoundingClientRect();
            let padding = parseInt(ips.getSetting('tableScrollTopPadding'));
            if (!Number.isInteger(padding)) {
                padding = 30;
            }
            if (boundingBox.top < padding) {
                window.scrollBy({
                    top: boundingBox.top - padding,
                    behavior: 'smooth'
                });
            }
        },
        changeFilteringFromMenu(e, data) {
            data.originalEvent?.preventDefault();
            if (!('selectedItemID'in data)) {
                return;
            }
            this.updateURL({
                filter: data.selectedItemID,
                [this._pageParam]: 1
            });
        },
        _cleanUpURL(url) {
            const urlObj = ips.utils.url.getURIObject(url);
            const params = _.clone(urlObj.queryKey);
            url = urlObj.protocol + '://' + urlObj.host + (urlObj.port ? (':' + urlObj.port) : '') + urlObj.path + '?';
            if (urlObj.file === 'index.php') {
                let hasFURL = false;
                for (const key of Object.keys(params)) {
                    if (key.startsWith('/')) {
                        hasFURL = true;
                        url += encodeURIComponent(key).replace(/%2f/ig, '/');
                        delete params[key];
                    }
                }
                if (hasFURL) {
                    url += '&';
                }
            }
            for (const param of ['sortby', 'sortdirection', 'filter', ...this._otherParams]) {
                delete params[param]
            }
            _.each(params, function(v, k) {
                delete params[k];
                params[decodeURIComponent(k).replace(/\+/g, ' ')] = v.replace(/\+/g, ' ');
            });
            if (!_.isEmpty(params)) {
                url += decodeURIComponent($.param(params));
            }
            url = url.replace(/[?&]$/, '')
            return url;
        },
        _cleanUpBaseURL() {
            this._baseURL = this._cleanUpURL(this._baseURL);
        },
        _handleStateChanges(state) {
            if ('filter'in state.data && state.data.filter != this._urlParams.filter) {
                this._updateFilter(state.data.filter);
            }
            for (const field of ['sortby', 'sortdirection']) {
                if (field in state.data && state.data[field] != this._urlParams[field]) {
                    this._updateSort({
                        by: state.data.sortby,
                        order: state.data.sortdirection
                    })
                    break;
                }
            }
            if (this._pageParam in state.data && state.data[this._pageParam] != this._urlParams[this._pageParam]) {
                this._updatePage(parseInt(state.data[this._pageParam]))
            }
        },
        _getResults(forceURL) {
            const urlBits = this._getURL();
            let url = '';
            try {
                if (this._ajax && _.isFunction(this._ajax.abort)) {
                    this._ajax.abort();
                    this._ajax = null;
                }
            } catch (err) {}
            if (forceURL) {
                url = forceURL;
            } else {
                if (urlBits) {
                    url = this._baseURL + this._getURL() + '&';
                } else {
                    url = this._baseURL;
                }
                if (this._seoPagination) {
                    url = ips.utils.url.pageParamToPath(url, this._pageParam, this._urlParams[this._pageParam]);
                }
            }
            if (this.scope.attr('data-resort') !== undefined) {
                url += `${url.includes('?') ? '&' : '?'}${this.scope.attr('data-resort')}=1`;
            }
            url = url.replaceAll(/\+/g, '%20');
            this._ajax = ips.getAjax()(url, {
                dataType: 'json',
                showLoading: this._showLoading()
            }).done(response => this._getResultsDone(response)).fail( (jqXHR, textStatus, errorThrown) => this._getResultsFail(jqXHR, textStatus, errorThrown, url)).always( (...args) => this._getResultsAlways(...args));
        },
        _showLoading() {
            return true;
        },
        _getResultsDone(response) {
            this._updateTable(response);
        },
        _getResultsFail: function(jqXHR, textStatus, errorThrown, url) {
            if (Debug.isEnabled() || textStatus == 'abort') {
                Debug.error(`Ajax request to '${url}' failed (` + textStatus + "): " + errorThrown);
                Debug.error(jqXHR.responseText);
            } else {
                window.location = this._baseURL + this._getURL();
            }
        },
        _updateTable(response) {
            const rows = this.scope.find('[data-role="tableRows"]');
            const pagination = this.scope.find('[data-role="tablePagination"]');
            const extra = this.scope.find('[data-role="extraHtml"]');
            const autoCheck = this.scope.find('[data-ipsAutoCheck]');
            if (!rows.length) {
                const url = this._baseURL + this._getURL();
                if (url === window.location.href) {
                    window.location.reload();
                } else {
                    window.location.href = url;
                }
                return;
            }
            ips.cleanContentsOf(rows)
            rows.html(response.rows).trigger('tableRowsUpdated');
            pagination.toggle((response.pagination && response.pagination.trim() !== "") || !_.isUndefined(pagination.attr('data-showEmpty'))).html(response.pagination || "").trigger('tablePaginationUpdated');
            extra.html(response.extraHtml);
            autoCheck.trigger('refresh.autoCheck');
            this.scope.get(0).querySelectorAll(':scope > *').forEach(child => $(document).trigger('contentChange', [$(child)]))
            try {
                if (IpsDataLayerConfig && !window.IpsDataLayerConfig) {
                    this.scope.find('[data-role="tablePagination"] [data-page]').click(function(e) {
                        let target = e.currentTarget;
                        if (target.parentNode.classList.contains('ipsPagination_active')) {
                            return;
                        }
                        let page = Number(e.currentTarget.dataset['page']);
                        if (isNaN(page))
                            return;
                        $('body').trigger('ipsDataLayerProperties', {
                            _properties: {
                                page_number: page
                            }
                        });
                    });
                }
            } catch (e) {}
        },
        _getURL(params) {
            params = params || this._urlParams
            const tmpUrlParams = {};
            for (const i in params) {
                if (['', 'controller', 'app', 'module', 'bypassState'].includes(i) || (i === this._pageParam && parseInt(params[i]) === 1) || !params[i]) {
                    continue
                }
                tmpUrlParams[i] = params[i];
            }
            return $.param(tmpUrlParams);
        },
        _getUrlParams: function() {
            var sort = this._getSortValue();
            var obj = {
                filter: this._getFilterValue() || '',
                sortby: sort.by || '',
                sortdirection: sort.order || '',
            };
            obj[this._pageParam] = ips.utils.url.getParam(this._pageParam) || 1
            return obj;
        },
        rowClick: function(e) {
            var target = $(e.target);
            if (target.is('a') || target.is('i') || target.is('input') || target.is('textarea') || target.is('code') || target.closest('a').length || target.closest('.ipsMenu').length) {
                return;
            }
            if (e.which !== 1 && e.which !== 2) {
                return;
            }
            if (e.altKey || e.shiftKey) {
                return;
            }
            if (target.is('td')) {
                var checkbox = target.find('input[type="checkbox"]');
                if (checkbox.length) {
                    checkbox.prop('checked', !checkbox.prop('checked'));
                    return;
                }
            }
            var link = $(e.currentTarget).find('[data-ipscontrolstrip]').parent().find('[data-controlStrip-action="' + $(e.currentTarget).attr('data-tableClickTarget') + '"]');
            if (e.metaKey || e.ctrlKey || e.which == 2) {
                link.attr('target', '_blank');
                link.get(0).click();
                link.attr('target', '');
            } else {
                link.get(0).click();
            }
        },
        _getSortValue: $.noop,
        _getFilterValue: $.noop,
        _getResultsAlways: $.noop
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.updateBanner', {
        initialize: function() {
            this.on('click', '[data-role="closeMessage"]', this.hideMessage);
        },
        hideMessage: function() {
            var date = new Date();
            date.setTime(date.getTime() + (7 * 86400000));
            ips.utils.cookie.set('updateBannerDismiss', true, date.toUTCString());
            this.scope.slideUp();
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.global.core.ftp', {
        initialize: function() {
            var scope = $(this.scope);
            scope.find('[data-role="portToggle"]').change(function() {
                scope.find('[data-role="portInput"]').val($(this).attr('data-port'));
            });
            scope.find('[data-role="serverInput"]').keyup(function() {
                var matches = $(this).val().match(/^((.+?):\/\/)?((.+?)(:(.+?)?)@)?(.+?\..+?)(:(\d+)?)?(\/.*)?$/);
                if (matches && (matches[1] || matches[3] || matches[8] || matches[10])) {
                    if (matches[2]) {
                        console.log(scope.find('[data-role="portToggle"][value="' + matches[2] + '"]'));
                        scope.find('[data-role="portToggle"][value="' + matches[2] + '"]').prop('checked', true);
                    }
                    if (matches[3]) {
                        if (matches[4]) {
                            scope.find('[data-role="usernameInput"]').val(matches[4]);
                            scope.find('[data-role="usernameInput"]').focus();
                        }
                        if (matches[6]) {
                            scope.find('[data-role="passwordInput"]').val(matches[6]);
                            scope.find('[data-role="passwordInput"]').focus();
                        }
                    }
                    if (matches[8]) {
                        scope.find('[data-role="portInput"]').val(matches[9]);
                        scope.find('[data-role="portInput"]').focus();
                    }
                    if (matches[10]) {
                        scope.find('[data-role="pathInput"]').val(matches[10]);
                        scope.find('[data-role="pathInput"]').focus();
                    }
                    $(this).val(matches[7]);
                }
            });
        },
    });
}(jQuery, _));
;