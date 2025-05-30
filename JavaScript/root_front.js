;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.markRead', {
        initialize: function() {
            this.on('click', this.markSiteRead);
        },
        markSiteRead: function(e) {
            e.preventDefault();
            ips.ui.alert.show({
                type: 'confirm',
                icon: 'question',
                message: ips.getString('markAsReadConfirm'),
                subText: '',
                callbacks: {
                    ok: function() {
                        var url = $(e.currentTarget).attr('href');
                        ips.getAjax()(url, {
                            showLoading: true
                        }).done(function() {
                            $(document).trigger('markAllRead');
                        }).fail(function(jqXHR, textStatus, errorThrown) {
                            window.location = url;
                        });
                    }
                }
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.messengerMenu', {
        initialize: function() {
            this.setup();
            this.on('click', '#elMessengerPopup_compose', this.clickCompose);
        },
        setup: function() {
            if (ips.utils.responsive.currentIs('phone')) {
                this.scope.find('#elMessengerPopup_compose').removeAttr('data-ipsDialog');
            }
        },
        clickCompose: function(e) {
            if (ips.utils.responsive.currentIs('phone')) {
                e.preventDefault();
                window.location = $(e.currentTarget).attr('href');
            } else {
                $('body').find('#elMobileDrawer .ipsDrawer_close').click();
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.mobileNav', {
        initialize: function() {
            this.on(document, 'notificationCountUpdate', this.updateCount);
        },
        updateCount: function(e, data) {
            if (!_.isUndefined(data.total)) {
                if (data.total <= 0) {
                    this.scope.find('[data-notificationType="total"]').hide();
                } else {
                    this.scope.find('[data-notificationType="total"]').text(parseInt(data.total));
                }
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.navBar', {
        _defaultItem: null,
        _usingSubBars: true,
        initialize: function() {
            var debounce = _.debounce(this.resizeWindow, 300);
            this.on(window, 'resize', debounce);
            this.on('mouseleave', this.mouseOutScope);
            this.on('mouseenter', this.mouseEnterScope);
            if (!$('body').attr('data-controller') || $('body').attr('data-controller').indexOf('core.global.customization.visualLang') == -1) {
                this.setup();
            } else {
                var self = this;
                $('body').on('vleDone', function() {
                    self.setup();
                });
            }
        },
        setup: function() {
            this.scope.identify();
            if (this.scope.find('[data-role="secondaryNavBar"]').length < 2) {
                this._usingSubBars = false;
            }
            if (this._usingSubBars && this.scope.find('.ipsNavBar_secondary > li.ipsNavBar_active').length > 1) {
                $.each(this.scope.find('.ipsNavBar_secondary > li.ipsNavBar_active'), function(i, elem) {
                    if ($(elem).find('a[data-ipsmenu]').length) {
                        $(elem).removeClass('ipsNavBar_active');
                    }
                });
            }
            if (!this._usingSubBars) {
                this.scope.find('#elNavigationMore_dropdown').append(" <i class='fa fa-caret-down'></i>").after(this.scope.find('#elNavigationMore_more_dropdown_menu').attr('id', 'elNavigationMore_dropdown_menu'));
            }
            if (this._usingSubBars) {
                if (ips.utils.events.isTouchDevice()) {
                    this.on('click', '[data-role="primaryNavBar"] > li > a', this.intentOver);
                } else {
                    this.scope.hoverIntent(_.bind(this.intentOver, this), $.noop, '[data-role="primaryNavBar"] > li');
                }
            }
            this._defaultItem = this.scope.find('[data-role="primaryNavBar"] > li > [data-navDefault]').attr('data-navitem-id');
            this._mushAllMenus();
        },
        mouseOutScope: function() {
            var self = this;
            if (ips.utils.events.isTouchDevice()) {
                return;
            }
            this._mouseOutTimer = setTimeout(function() {
                self._makeDefaultActive();
                self.scope.find('[data-ipsMenu]').trigger('closeMenu');
            }, 500);
        },
        mouseEnterScope: function() {
            clearTimeout(this._mouseOutTimer);
        },
        intentOver: function(e) {
            var li = $(e.currentTarget);
            var link = li.find('> a');
            var allItems = this.scope.find('[data-role="primaryNavBar"] > li');
            if (li.is('a')) {
                li = li.closest('li');
                link = li.find('> a');
            }
            if (ips.utils.events.isTouchDevice() && li.hasClass('ipsNavBar_active')) {
                return;
            }
            if (ips.utils.events.isTouchDevice()) {
                e.preventDefault();
            }
            this.scope.find('[data-ipsMenu]').trigger('closeMenu');
            allItems.removeClass('ipsNavBar_active').find('> a').removeAttr('data-active');
            li.addClass('ipsNavBar_active');
            link.attr('data-active', true);
        },
        resizeWindow: function() {
            this._mushAllMenus();
        },
        _makeDefaultActive: function() {
            var link = this.scope.find('[data-navitem-id="' + this._defaultItem + '"]');
            var list = link.closest('li');
            var allItems = this.scope.find('[data-role="primaryNavBar"] > li');
            allItems.removeClass('ipsNavBar_active').find('> a').removeAttr('data-active');
            list.addClass('ipsNavBar_active').find('> a').attr('data-active', true);
            if (link.closest('[data-role="secondaryNavBar"]').length) {
                link.closest('[data-role="secondaryNavBar"]').closest('li').addClass('ipsNavBar_active').find('> a').attr('data-active', true);
            }
        },
        _mushMenu: function(bar, widthAdjustment) {
            var self = this;
            var padding = parseInt(this.scope.css('padding-left')) + parseInt(this.scope.css('padding-right'));
            var availableSpace = this._getNavElement().width() - widthAdjustment - padding;
            var moreItem = bar.find('> [data-role="navMore"]');
            var moreMenuSize = moreItem.outerWidth();
            var menuItems = bar.find('> li[data-role="navBarItem"]');
            var sizeIncrement = 0;
            var dropdown = bar.find('[data-role="moreDropdown"]');
            if (!moreItem.is(':visible')) {
                moreMenuSize = moreItem.removeClass('ipsHide').outerWidth();
                moreItem.addClass('ipsHide');
            }
            menuItems.each(function() {
                var item = $(this);
                var itemSize = 0;
                if (item.attr('data-originalWidth')) {
                    itemSize = parseInt(item.attr('data-originalWidth'));
                } else {
                    var o = item.outerWidth() + parseInt(item.css('margin-right')) + parseInt(item.css('margin-left'));
                    item.attr('data-originalWidth', o);
                    itemSize = o;
                }
                if ((sizeIncrement + itemSize + moreMenuSize) > availableSpace) {
                    if (!item.attr('data-mushed')) {
                        var newLI = $('<li/>').attr('data-originalItem', item.identify().attr('id')).append(item.contents());
                        if (self._usingSubBars) {
                            if (bar.is('[data-role="primaryNavBar"]')) {
                                bar.find('> [data-role="navMore"] > [data-role="secondaryNavBar"]').append(newLI);
                                if (newLI.find('> [data-role="secondaryNavBar"] > li').length) {
                                    var newA = newLI.find('> a');
                                    var newDropdown = $('<ul/>').addClass('ipsMenu ipsMenu_auto ipsHide').attr('id', newA.identify().attr('id') + '_menu').attr('data-mushedDropdown', item.identify().attr('id'));
                                    newLI.find('> [data-role="secondaryNavBar"] > li').each(function() {
                                        if ($(this).is('[data-role="navMore"]')) {
                                            return;
                                        }
                                        var newMenuItem = $('<li/>').addClass('ipsMenu_item');
                                        if ($(this).find('.ipsMenu').length) {
                                            newMenuItem.addClass('ipsMenu_subItems');
                                        }
                                        var menuContent = $(this).contents();
                                        menuContent.find('.fa.fa-caret-down').addClass('ipsHide');
                                        newDropdown.append(newMenuItem.append(menuContent).attr('data-originalItem', $(this).identify().attr('id')));
                                    });
                                    newA.attr('data-ipsMenu', '').attr('data-ipsMenu-appendTo', '#' + self.scope.identify().attr('id')).append("<i class='fa fa-caret-down' data-role='mushedCaret'></i>");
                                    newLI.append(newDropdown);
                                }
                            } else {
                                newLI.addClass('ipsMenu_item');
                                if (newLI.find('.ipsMenu').length) {
                                    newLI.addClass('ipsMenu_subItems');
                                }
                                dropdown.append(newLI);
                            }
                        } else {
                            self.scope.find('#elNavigationMore_dropdown_menu').append(newLI.addClass('ipsMenu_item'));
                            if (newLI.find('.ipsMenu').length) {
                                newLI.addClass('ipsMenu_subItems');
                            }
                        }
                        var linkInList = newLI.children('a');
                        if (linkInList.is('[data-ipsMenu]')) {
                            linkInList.attr('data-ipsMenu-appendTo', '#' + newLI.identify().attr('id'));
                        }
                        item.addClass('ipsHide').attr('data-mushed', true);
                    }
                } else if (item.attr('data-mushed')) {
                    var mushedParent = null;
                    var mushedItem = null;
                    if (!self._usingSubBars) {
                        mushedParent = self.scope.find('#elNavigationMore_dropdown_menu');
                    } else if (bar.is('[data-role="primaryNavBar"]')) {
                        mushedParent = bar.find('> [data-role="navMore"] > [data-role="secondaryNavBar"]');
                    } else {
                        mushedParent = dropdown;
                    }
                    var mushedItem = mushedParent.find('[data-originalItem="' + item.identify().attr('id') + '"]');
                    if (mushedItem.children('a').is('[data-ipsMenu]')) {
                        mushedItem.children('a').attr('data-ipsMenu-appendTo', '#' + item.identify().attr('id'));
                    }
                    if (mushedItem.length) {
                        item.append(mushedItem.contents()).removeClass('ipsHide');
                    }
                    if (self._usingSubBars && bar.is('[data-role="primaryNavBar"]')) {
                        var mushedDropdown = self.scope.find('[data-mushedDropdown="' + item.attr('id') + '"]');
                        var secondaryMenu = item.find('> [data-role="secondaryNavBar"]');
                        if (mushedDropdown.length) {
                            mushedDropdown.find('> .ipsMenu_item').each(function() {
                                var originalItem = self.scope.find('#' + $(this).attr('data-originalItem'));
                                originalItem.append($(this).contents());
                            });
                            mushedDropdown.remove();
                        }
                        item.find('[data-role="mushedCaret"]').remove();
                    }
                    mushedItem.remove();
                    item.removeAttr('data-mushed');
                    item.find('.fa.fa-caret-down').removeClass('ipsHide');
                }
                sizeIncrement += itemSize;
            });
            if (bar.is('[data-role="primaryNavBar"]')) {
                if (this._usingSubBars) {
                    moreItem.toggleClass('ipsHide', bar.find('> [data-role="navMore"] > [data-role="secondaryNavBar"] > li').length <= 1);
                } else {
                    moreItem.toggleClass('ipsHide', !this.scope.find('#elNavigationMore_dropdown_menu > li').length);
                }
            } else {
                moreItem.toggleClass('ipsHide', dropdown.find('> li').length < 1);
            }
            this._makeDefaultActive();
        },
        _mushAllMenus: function() {
            this._mushMenu(this.scope.find('[data-role="primaryNavBar"]'), this.scope.find('#elSearch').outerWidth());
            this._mushMenu(this.scope.find('[data-role="secondaryNavBar"]:visible'), 0);
        },
        _getNavElement: function() {
            if (this.scope.hasClass('ipsNavBar_primary')) {
                return this.scope;
            } else {
                return this.scope.find('.ipsNavBar_primary');
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.pagination', {
        initialize: function() {
            this.on('paginationClicked paginationJump', this.paginationClick);
        },
        paginationClick: function(e, data) {
            var self = this;
            if (!data.href) {
                return;
            }
            ips.getAjax()(data.href).done(function(response) {
                self.scope.hide().html(response);
                ips.utils.links.updateExternalLinks();
                ips.utils.anim.go('fadeIn', self.scope);
            }).fail(function() {
                window.location = data.href;
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.quickSearch', {
        initialize: function() {
            this.on('mouseup', '.cSearchFilter__menu', this.updateAndClose);
            this.on('change', 'input[name="type"]', this.updateFilter);
            this.on('focus', '.cSearchSubmit', this.a11yFocusSubmit);
            this.on('keypress', '.cSearchFilter__text', this.a11yOpenDetails);
            this.setup();
        },
        setup: function() {
            document.querySelector('.cSearchFilter__text').innerText = document.querySelector('.cSearchFilter__menu input:checked + .cSearchFilter__menuText').innerHTML;
        },
        updateFilter: function(e) {
            document.querySelector('.cSearchFilter__text').innerText = e.target.nextElementSibling.innerHTML;
        },
        updateAndClose: function(e) {
            setTimeout( () => {
                document.querySelector('.cSearchFilter').open = false;
                document.querySelector('#elSearchField').focus();
            }
            , "500");
        },
        a11yOpenDetails: function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                document.querySelector('.cSearchFilter').open = true;
                document.querySelector('.cSearchFilter__menu input:checked').focus();
            }
        },
        a11yFocusSubmit: function(e) {
            document.querySelector('.cSearchFilter').open = false;
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.rating', {
        initialize: function() {
            this.on('ratingSaved', '[data-ipsRating]', this.ratingClick);
            var scope = this.scope;
        },
        ratingClick: function(e, data) {
            var scope = $(this.scope);
            ips.getAjax()(scope.attr('action'), {
                data: scope.serialize(),
                type: 'post'
            }).done(function(response, textStatus, jqXHR) {}).fail(function() {
                scope.submit();
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.reaction', {
        _reactTypeContainer: null,
        _reactButton: null,
        _reactTypes: null,
        _reactClose: null,
        _ajaxObj: null,
        initialize: function() {
            this.on('click', '[data-role="reactionInteraction"]', this.clickLaunchReaction);
            this.on('mouseenter', '[data-role="reactionInteraction"]', this.launchReaction);
            this.on('mouseleave', '[data-role="reactionInteraction"]', this.unlaunchReaction);
            this.on('click', '[data-role="reaction"]', this.clickReaction);
            this.on('click', '[data-action="unreact"]', this.unreact);
            this.setup();
        },
        setup: function() {
            this._reactTypeContainer = this.scope.find('[data-role="reactionInteraction"]');
            this._reactTypes = this._reactTypeContainer.find('[data-role="reactTypes"]');
            this._reactButton = this._reactTypeContainer.find('[data-action="reactLaunch"]');
            this._reactClose = this._reactTypeContainer.find('[data-action="unreact"]');
            this._reactBlurb = this.scope.find('[data-role="reactionBlurb"]');
            this._reactCount = this.scope.find('[data-role="reactCount"]');
            this._singleReaction = !(this._reactTypes.length);
        },
        clickLaunchReaction: function(e) {
            if (!ips.utils.events.isTouchDevice() || this._singleReaction) {
                return;
            }
            this._reactTypeContainer.addClass('ipsReact_types_active');
            this._launchReaction();
        },
        launchReaction: function() {
            if (ips.utils.events.isTouchDevice()) {
                return;
            }
            this._launchReaction();
        },
        _launchReaction: function() {
            var self = this;
            this._reactTypes.show().removeClass('ipsReact_hoverOut').addClass('ipsReact_hover');
        },
        unlaunchReaction: function() {
            var self = this;
            this._reactTypes.animationComplete(function() {
                if (self._reactTypes.hasClass('ipsReact_hoverOut')) {
                    self._reactTypes.removeClass('ipsReact_hoverOut').hide();
                }
            });
            this._reactTypes.removeClass('ipsReact_hover').addClass('ipsReact_hoverOut');
            this._reactTypeContainer.removeClass('ipsReact_types_active');
        },
        unreact: function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            var self = this;
            var defaultReaction = this.scope.find('[data-defaultReaction]');
            var url = this._reactTypeContainer.attr('data-unreact');
            if (!defaultReaction.closest('[data-action="reactLaunch"]').length) {
                var currentReaction = this._reactButton.find('[data-role="reaction"]');
                var defaultReactionCopy = defaultReaction.clone();
                var currentReactionCopy = currentReaction.clone();
                currentReaction.replaceWith(defaultReactionCopy.removeClass('ipsReact_active'));
                defaultReaction.replaceWith(currentReactionCopy.removeClass('ipsReact_active'));
            }
            this._reactButton.removeClass('ipsReact_reacted');
            self._reactClose.fadeOut();
            self.unlaunchReaction();
            ips.getAjax()(url).done(function(response) {
                self._updateReaction(response, ips.getString('removedReaction'));
            });
        },
        _updateReaction: function(response, flashMsg) {
            if (this._reactCount.hasClass('ipsReact_reactCountOnly')) {
                this._reactCount.find('[data-role="reactCountText"]').text(response.score).removeClass('ipsAreaBackground_positive ipsAreaBackground_negative ipsAreaBackground_light');
                if (parseInt(response.score) >= 1) {
                    this._reactCount.addClass('ipsAreaBackground_positive');
                } else if (parseInt(response.score) < 0) {
                    this._reactCount.addClass('ipsAreaBackground_negative');
                } else {
                    this._reactCount.addClass('ipsAreaBackground_light');
                }
                if (response.count == 0) {
                    this._reactCount.hide();
                } else {
                    this._reactCount.show();
                }
            } else {
                this._reactBlurb.html(response.blurb);
                this._reactCount.text(response.count);
                if (parseInt(response.count) > 0) {
                    this._reactBlurb.removeClass('ipsHide').fadeIn();
                } else {
                    this._reactBlurb.fadeOut();
                }
            }
            this._reactTypeContainer.removeClass('ipsReact_types_active');
            if (flashMsg) {
                ips.ui.flashMsg.show(flashMsg);
            }
        },
        clickReaction: function(e) {
            e.preventDefault();
            if (this._singleReaction && this._reactButton.hasClass('ipsReact_reacted')) {
                this.unreact(null);
                return;
            }
            if (ips.utils.events.isTouchDevice() && (!this._singleReaction && !this._reactTypeContainer.hasClass('ipsReact_types_active'))) {
                return;
            }
            var self = this;
            var reaction = $(e.currentTarget);
            var url = reaction.attr('href');
            var currentButton = this.scope.find('[data-action="reactLaunch"] > [data-role="reaction"]');
            var newReaction = (!$(e.currentTarget).closest('[data-action="reactLaunch"]').length || !this._reactButton.hasClass('ipsReact_reacted'));
            this._removeActiveReaction();
            reaction.addClass('ipsReact_active');
            this._reactButton.addClass('ipsReact_reacted');
            if (reaction.closest('[data-action="reactLaunch"]').length == 0) {
                var _complete = function() {
                    var currentButtonCopy = currentButton.clone();
                    var reactionCopy = reaction.clone();
                    currentButton.replaceWith(reactionCopy.removeClass('ipsReact_active'));
                    reaction.replaceWith(currentButtonCopy.removeClass('ipsReact_active'));
                    setTimeout(function() {
                        self._reactClose.fadeIn();
                    }, 400);
                    self.unlaunchReaction();
                    self._removeActiveReaction();
                };
            } else {
                var _complete = function() {
                    setTimeout(function() {
                        self._reactClose.fadeIn();
                    }, 400);
                    self.unlaunchReaction();
                    self._removeActiveReaction();
                };
            }
            setTimeout(_complete, 400);
            if (newReaction) {
                if (this._ajaxObj && _.isFunction(this._ajaxObj.abort)) {
                    this._ajaxObj.abort();
                }
                let reactionTitle = reaction.innerText;
                let reactionIcon = reaction.find('img[data-ipsTooltip]');
                if (reactionIcon && reactionIcon.attr('_title')) {
                    reactionTitle = reactionIcon.attr('_title');
                }
                reactionTitle = reactionTitle || undefined;
                this._ajaxObj = ips.getAjax()(url).done(function(response) {
                    self._updateReaction(response);
                    try {
                        if (IpsDataLayerConfig && IpsDataLayerConfig._events.content_react.enabled) {
                            let context = IpsDataLayerContext || {};
                            $('body').trigger('ipsDataLayer', {
                                _key: 'content_react',
                                _properties: {
                                    ...context,
                                    'reaction_type': reactionTitle,
                                    ...(response.datalayer || {})
                                },
                            });
                        }
                    } catch (e) {}
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    Debug.log('fail');
                    if (!_.isUndefined(jqXHR.responseJSON) && jqXHR.responseJSON.error == 'react_daily_exceeded') {
                        ips.ui.alert.show({
                            type: 'alert',
                            icon: 'warn',
                            message: ips.getString('reactDailyExceeded'),
                            callbacks: {}
                        });
                    } else {
                        ips.ui.alert.show({
                            type: 'alert',
                            icon: 'warn',
                            message: ips.getString('reactError'),
                            callbacks: {}
                        });
                    }
                    self._reactButton.removeClass('ipsReact_reacted');
                    self._reactClose.remove();
                });
            }
        },
        _removeActiveReaction: function() {
            this._reactTypeContainer.find('.ipsReact_active').removeClass('ipsReact_active');
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.recommendedComments', {
        initialize: function() {
            this.on(document, 'refreshRecommendedComments', this.refresh);
            this.on(document, 'removeRecommendation', this.removeRecommendation);
        },
        refresh: function(e, data) {
            var self = this;
            if (data.scroll) {
                if (!this.scope.is(':visible')) {
                    this.scope.show();
                }
                var once = _.bind(_.once(self._doRefresh), this);
                $('html, body').animate({
                    scrollTop: this.scope.offset().top + 'px'
                }, function() {
                    once(data.recommended);
                });
            } else {
                self._doRefresh(data.recommended);
            }
        },
        removeRecommendation: function(e, data) {
            var self = this;
            var comment = this.scope.find('[data-commentID="' + data.commentID + '"]');
            if (comment.length) {
                comment.fadeOut().slideUp(function() {
                    comment.remove();
                    if (!self.scope.find('[data-commentID]').length) {
                        self.scope.hide();
                    }
                });
            }
        },
        _doRefresh: function(newId) {
            var self = this;
            ips.getAjax()(this.scope.attr('data-url')).done(function(response) {
                self._handleResponse(response, newId);
            }).fail(function() {
                window.reload();
            });
        },
        _handleResponse: function(response, newId) {
            var content = $('<div>' + response.html + '</div>').find('[data-controller="core.front.core.recommendedComments"]');
            if (parseInt(response.count) > 0) {
                this.scope.show();
            } else {
                this.scope.hide();
            }
            if (!response.count) {
                return;
            }
            if (newId) {
                var newComment = content.find('[data-commentID="' + newId + '"]');
                newComment.hide();
                if (newComment.is(':last-child')) {
                    this.scope.find('[data-role="recommendedComments"]').append(newComment);
                } else if (newComment.is(':first-child')) {
                    this.scope.find('[data-role="recommendedComments"]').prepend(newComment);
                } else {
                    var prev = newComment.prev('[data-commentID]');
                    prev.after(newComment);
                }
                $(document).trigger('contentChange', [newComment]);
                newComment.fadeIn().slideDown();
            } else {
                this.scope.html(content);
                $(document).trigger('contentChange', [this.scope]);
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.reputation', {
        initialize: function() {
            this.on('click', '[data-action="giveReputation"]', this.giveReputation);
        },
        giveReputation: function(e) {
            e.preventDefault();
            var self = this;
            var url = $(e.currentTarget).attr('href');
            var thisParent = this.scope.parent();
            this.scope.css({
                opacity: "0.5"
            });
            ips.getAjax()(url).done(function(response) {
                var newHTML = $('<div>' + response + '</div>').find('[data-controller="core.front.core.reputation"]').html();
                self.scope.html(newHTML).css({
                    opacity: "1"
                });
            }).fail(function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON['error']) {
                    ips.ui.alert.show({
                        type: 'alert',
                        icon: 'warn',
                        message: jqXHR.responseJSON['error'],
                        callbacks: {}
                    });
                } else {
                    window.location = url;
                }
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.sharelink', {
        initialize: function() {
            this.on('click', '[data-role="shareLink"]', this.launchWindow);
        },
        launchWindow: function(e) {
            e.preventDefault();
            var url = $(e.currentTarget).attr('href');
            if (!ips.utils.url.getParam('url', url)) {
                url += "&url=" + encodeURIComponent(location.href);
            }
            if (!ips.utils.url.getParam('title', url)) {
                url += "&title=" + encodeURIComponent(document.title);
            }
            window.open(url, 'delicious', 'toolbar=no,width=550,height=550');
        },
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.statuses', {
        initialize: function() {
            this._hideReplyFields();
            this.on('click', '[data-action="delete"]', this.deleteStatus);
            this.on('click', '[data-action="lock"]', this.lockStatus);
            this.on('click', '[data-action="unlock"]', this.unlockStatus);
            this.on('click', '[data-action="reply"]', this.replyStatus);
            this.on('click', '[data-action="loadPreviousComments"]', this.loadPrevious);
            this.on('blur', '[data-role="replyComment"] input[type="text"]', this.blurCommentField);
            this.on('keydown', '[data-role="replyComment"] input[type="text"]', this.keydownCommentField);
            this.on(document, 'lockingStatus', this.togglingStatus);
            this.on(document, 'lockedStatus', this.lockedStatus);
            this.on(document, 'unlockingStatus', this.togglingStatus);
            this.on(document, 'unlockedStatus', this.unlockedStatus);
            this.on(document, 'deletingStatus deletingComment', this.deletingStatus);
            this.on(document, 'deletedStatus deletedComment', this.deletedStatus);
            this.on(document, 'loadingComments', this.loadingComments);
            this.on(document, 'loadedComments', this.loadedComments);
            this.on(document, 'addingComment', this.addingComment);
            this.on(document, 'addedComment', this.addedComment);
        },
        _requestCount: {},
        _offsets: {},
        _hideReplyFields: function() {
            $(this.scope).find('[data-statusid]').not('.ipsComment_hasChildren').find('.ipsComment_subComments').hide().end().end().find('[data-role="submitReply"]').hide();
        },
        loadPrevious: function(e) {
            e.preventDefault();
            var link = $(e.currentTarget)
              , statusElem = link.parents('[data-statusid]')
              , statusID = $(statusElem).data('statusid');
            this._offsets[statusID] = (statusElem.find('[data-commentid]').length) * -1;
            this.trigger('loadComments', {
                statusID: statusID,
                offset: this._offsets[statusID]
            });
        },
        loadingComments: function(e, data) {
            var status = $(this.scope).find('[data-statusid="' + data.statusID + '"]');
            status.find('[data-action="loadPreviousComments"]').html(ips.templates.render('core.statuses.loadingComments'));
        },
        loadedComments: function(e, data) {
            var status = $(this.scope).find('[data-statusid="' + data.statusID + '"]')
              , loadingRow = status.find('[data-action="loadPreviousComments"]');
            loadingRow.after(data.comments);
            var totalShown = status.find('[data-commentid]').length;
            if (data.total <= totalShown) {
                loadingRow.remove();
            } else {
                loadingRow.html(ips.templates.render('core.statuses.loadMore')).find("[data-role='remainingCount']").text(data.total - totalShown);
            }
            $(document).trigger('contentChange', [status]);
        },
        deleteStatus: function(e) {
            e.preventDefault();
            var link = $(e.currentTarget)
              , statusElem = link.parents('[data-statusid]')
              , commentElem = link.parents('[data-commentid]')
              , statusID = $(statusElem).data('statusid')
              , commentID = $(commentElem).data('commentid');
            if (commentElem) {
                if (confirm(ips.getString('confirmStatusCommentDelete'))) {
                    this.trigger('deleteComment', {
                        statusID: statusID,
                        commentID: commentID
                    });
                }
            } else {
                if (confirm(ips.getString('confirmStatusDelete'))) {
                    this.trigger('deleteStatus', {
                        statusID: statusID
                    });
                }
            }
        },
        deletingStatus: function(e, data) {
            if (data.commentID) {
                $(this.scope).find('[data-commentid="' + data.commentID + '"]').animate({
                    opacity: "0.5"
                });
            } else {
                $(this.scope).find('[data-statusid="' + data.statusID + '"]').animate({
                    opacity: "0.5"
                });
            }
        },
        deletedStatus: function(e, data) {
            if (data.commentID) {
                $(this.scope).find('[data-commentid="' + data.commentID + '"]').remove();
            } else {
                $(this.scope).find('[data-statusid="' + data.statusID + '"]').remove();
            }
        },
        lockStatus: function(e) {
            e.preventDefault();
            var link = $(e.currentTarget)
              , statusElem = link.parents('[data-statusid]')
              , statusID = $(statusElem).data('statusid');
            this.trigger('lockStatus', {
                statusID: statusID
            });
        },
        unlockStatus: function(e) {
            e.preventDefault();
            var link = $(e.currentTarget)
              , statusElem = link.parents('[data-statusid]')
              , statusID = $(statusElem).data('statusid');
            this.trigger('unlockStatus', {
                statusID: statusID
            });
        },
        lockedStatus: function(e, data) {
            var status = $(this.scope).find('[data-statusid="' + data.statusID + '"]');
            $(status).find('[data-action="lock"]').first().replaceWith(ips.templates.render('core.statuses.unlock'));
            this._finishedAction(e, data);
        },
        unlockedStatus: function(e, data) {
            var status = $(this.scope).find('[data-statusid="' + data.statusID + '"]');
            $(status).find('[data-action="unlock"]').first().replaceWith(ips.templates.render('core.statuses.lock'));
            this._finishedAction(e, data);
        },
        togglingStatus: function(e, data) {
            var status = $(this.scope).find('[data-statusid="' + data.statusID + '"]')
              , loadingThingy = status.find('.cStatusTools_loading');
            if (!loadingThingy.length) {
                status.find('.cStatusTools').first().append(ips.templates.render('core.statuses.statusAction'));
            } else {
                loadingThingy.show();
            }
            if (!this._requestCount[data.statusID]) {
                this._requestCount[data.statusID] = 1;
            } else {
                this._requestCount[data.statusID]++;
            }
        },
        _finishedAction: function(e, data) {
            var status = $(this.scope).find('[data-statusid="' + data.statusID + '"]')
              , loadingThingy = status.find('.cStatusTools_loading');
            this._requestCount[data.statusID]--;
            if (this._requestCount[data.statusID] == 0) {
                loadingThingy.remove();
            }
        },
        replyStatus: function(e) {
            e.preventDefault();
            var link = $(e.currentTarget)
              , statusElem = link.parents('[data-statusid]');
            if (statusElem.find('[data-commentid]').length > 0) {
                statusElem.find('[data-role="replyComment"] input[type="text"]').focus();
                return;
            }
            Debug.log(statusElem.find('.ipsComment_subComments').is(':visible'));
            if (!statusElem.find('.ipsComment_subComments').is(':visible')) {
                ips.utils.anim.go('fadeIn', statusElem.find('.ipsComment_subComments'));
                statusElem.addClass('ipsComment_hasChildren').find('[data-role="replyComment"] input[type="text"]').focus();
            } else {
                if (statusElem.find('[data-commentid]').length == 0 && field.val() == '') {
                    statusElem.removeClass('ipsComment_hasChildren').find('.ipsComment_subComments, [data-role="submitReply"]').hide();
                }
            }
        },
        blurCommentField: function(e) {
            e.preventDefault();
            var field = $(e.currentTarget)
              , statusElem = field.parents('[data-statusid]')
              , replyButton = statusElem.find('[data-role="submitReply"]');
            if (statusElem.find('[data-commentid]').length == 0 && field.val() == '') {
                statusElem.removeClass('ipsComment_hasChildren').find('.ipsComment_subComments').hide();
            }
        },
        keydownCommentField: function(e) {
            var field = $(e.currentTarget)
              , statusElem = field.parents('[data-statusid]')
              , statusID = statusID = $(statusElem).data('statusid');
            if (e.keyCode == ips.ui.key.ENTER) {
                this.trigger('addComment', {
                    content: field.val(),
                    statusID: statusID
                });
            }
        },
        addingComment: function(e, data) {
            var statusElem = $(this.scope).find('[data-statusid="' + data.statusID + '"]')
              , replyRow = statusElem.find('[data-role="replyComment"]');
            replyRow.find('input[type="text"]').prop('disabled', true).addClass('ipsField_disabled');
        },
        addedComment: function(e, data) {
            var statusElem = $(this.scope).find('[data-statusid="' + data.statusID + '"]')
              , replyRow = statusElem.find('[data-role="replyComment"]')
              , subComments = statusElem.find('.ipsComment_subComments');
            if (replyRow.length) {
                replyRow.before(data.comment);
            } else if (subComments.length) {
                subComments.append(data.comment);
            }
            statusElem.find('[data-role="replyComment"] input[type="text"]').val('').blur().prop('disabled', false).removeClass('ipsField_disabled');
        },
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.userbar', {
        loaded: {},
        initialize: function() {
            this.on(document, 'menuOpened', this.menuOpened);
            this.on(document, 'clearUserbarCache', this.clearUserbarCache);
        },
        menuOpened: function(e, data) {
            if (data.elemID == 'elFullInbox' || data.elemID == 'elMobInbox') {
                this._loadMenu('inbox', ips.getSetting('baseURL') + 'index.php?app=core&module=messaging&controller=messenger&overview=1&_fromMenu=1', 'inbox');
            } else if (data.elemID == 'elFullNotifications' || data.elemID == 'elMobNotifications') {
                this._loadMenu('notify', ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=notifications', 'notify');
            } else if (data.elemID == 'elFullReports' || data.elemID == 'elMobReports') {
                this._loadMenu('reports', ips.getSetting('baseURL') + 'index.php?app=core&module=modcp&controller=modcp&tab=reports&overview=1', 'reports');
            }
        },
        clearUserbarCache: function(e, data) {
            this.loaded[data.type] = false;
        },
        _loadMenu: function(type, url, contentID) {
            if (!this.loaded[type]) {
                var self = this;
                var ajaxObj = ips.getAjax();
                $('[data-role="' + contentID + 'List"]').html('').css({
                    height: '100px'
                }).addClass('ipsLoading');
                ajaxObj(url, {
                    dataType: 'json'
                }).done(function(returnedData) {
                    $('[data-role="' + contentID + 'List"]').css({
                        height: 'auto'
                    }).removeClass('ipsLoading').html(returnedData.data);
                    self.loaded[type] = true;
                    if (contentID != 'reports') {
                        var thisTotal = $('[data-notificationType="' + contentID + '"]').html();
                        var globalCount = parseInt($('[data-notificationType="total"]').html());
                        ips.utils.anim.go('fadeOut', $('[data-notificationType="' + contentID + '"]'));
                        $('[data-notificationType="total"]').html(globalCount - parseInt(thisTotal));
                        if (globalCount - parseInt(thisTotal) <= 0) {
                            ips.utils.anim.go('fadeOut', $('[data-notificationType="total"]'));
                        }
                    }
                    $(document).trigger('contentChange', [$('[data-role="' + contentID + 'List"]')]);
                }).fail(function() {});
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.webshare', {
        initialize: function() {
            if (navigator.share) {
                this._render();
                this.on('click', this.initShare);
            }
        },
        _render: function() {
            $('[data-role="webShare"]').removeClass('ipsHide');
        },
        initShare: function(e) {
            try {
                navigator.share({
                    title: this.scope.attr('data-webShareTitle'),
                    text: this.scope.attr('data-webShareText'),
                    url: this.scope.attr('data-webShareUrl')
                });
            } catch (err) {
                Debug.log("Failed to use web share API: ", err);
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.model.register('core.comment', {
        initialize: function() {
            this.on('getEditForm.comment', this.getEditForm);
            this.on('saveEditComment.comment', this.saveEditComment);
            this.on('deleteComment.comment', this.deleteComment);
            this.on('newComment.comment', this.newComment);
            this.on('approveComment.comment', this.approveComment);
            this.on('unrecommendComment.comment', this.unrecommendComment);
        },
        getEditForm: function(e, data) {
            this.getData({
                url: data.url,
                dataType: 'html',
                data: {},
                events: 'getEditForm',
                namespace: 'comment'
            }, data);
        },
        saveEditComment: function(e, data) {
            var url = data.url;
            this.getData({
                url: data.url,
                dataType: 'html',
                type: 'post',
                data: data.form || {},
                events: 'saveEditComment',
                namespace: 'comment'
            }, data);
        },
        approveComment: function(e, data) {
            this.getData({
                url: data.url,
                dataType: 'html',
                data: data.form || {},
                events: 'approveComment',
                namespace: 'comment'
            }, data);
        },
        unrecommendComment: function(e, data) {
            this.getData({
                url: data.url,
                dataType: 'json',
                data: data.form || {},
                events: 'unrecommendComment',
                namespace: 'comment'
            }, data);
        },
        deleteComment: function(e, data) {
            this.getData({
                url: data.url,
                dataType: 'html',
                data: data.form || {},
                events: 'deleteComment',
                namespace: 'comment'
            }, data);
        },
        newComment: function(e, data) {
            this.getData({
                url: data.url,
                dataType: 'json',
                data: data.form || {},
                events: 'newComment',
                namespace: 'comment'
            }, data);
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.app', {
        initialize: function() {
            this.on('click', 'a[data-confirm],button[data-confirm]', this.confirmSomething);
            this.on(document, 'contentChange', this._checkAndClearAutosave);
            this.on(document, 'contentChange', this.checkOldEmbeds);
            this.on(document, 'contentChange', this.updateExternalLinks);
            this.setup();
        },
        setup: function() {
            if (ips.utils.serviceWorker.supported) {
                ips.utils.serviceWorker.registerServiceWorker('front', !_.isUndefined(ips.utils.cookie.get('loggedIn')));
            }
            this.scope.addClass('ipsJS_has').removeClass('ipsJS_none');
            if (!ips.utils.events.isTouchDevice()) {
                this.scope.addClass('ipsApp_noTouch');
            }
            ips.utils.cookie.set('ipsTimezone', new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
            this._checkAndClearAutosave();
            if (!ips.getSetting('memberID') && ips.utils.url.getParam('_fromLogout')) {
                ips.utils.db.removeByType('editorSave');
            }
            if ($('#elInlineMessage').length) {
                var dialogRef = ips.ui.dialog.create({
                    showFrom: '#inbox',
                    content: '#elInlineMessage',
                    title: $('#elInlineMessage').attr('title')
                });
                setTimeout(function() {
                    dialogRef.show();
                }, 800);
            }
            ips.utils.links.updateExternalLinks(this.scope);
            this._upgradeOldEmbeds(this.scope);
            this._fixMissingLazyLoadItems(this.scope);
            prettyPrint();
            if (_.isUndefined(ips.utils.cookie.get('hasJS'))) {
                var expires = new Date();
                expires.setDate(expires.getDate() + 1);
                ips.utils.cookie.set('hasJS', true, expires.toUTCString());
            }
            if (!ips.getSetting('viewProfiles')) {
                this._removeProfileLinks();
            }
        },
        updateExternalLinks: function(e, data) {
            ips.utils.links.updateExternalLinks(data);
        },
        checkOldEmbeds: function(e, data) {
            this._upgradeOldEmbeds(data);
        },
        _removeProfileLinks: function() {
            this.scope.find('a[data-mentionid],a[href*="controller=profile"]').replaceWith(function() {
                return $(this).contents();
            });
        },
        _upgradeOldEmbeds: function(element) {
            if (_.isUndefined(element)) {
                return;
            }
            var oldEmbeds = element.find('[data-embedcontent]:not([data-controller], [data-embed-src])');
            var toRefresh = [];
            if (oldEmbeds.length) {
                oldEmbeds.each(function() {
                    $(this).attr('data-controller', 'core.front.core.autoSizeIframe');
                    toRefresh.push(this);
                    Debug.log("Upgraded old embed");
                });
                $(document).trigger('contentChange', [jQuery([]).pushStack(toRefresh)]);
            }
        },
        _checkAndClearAutosave: function() {
            if (ips.utils.cookie.get('clearAutosave')) {
                var autoSaveKeysToClear = ips.utils.cookie.get('clearAutosave').split(',');
                for (var i = 0; i < autoSaveKeysToClear.length; i++) {
                    ips.utils.db.remove('editorSave', autoSaveKeysToClear[i]);
                }
                ips.utils.cookie.unset('clearAutosave');
            }
        },
        confirmSomething: function(e) {
            e.preventDefault();
            var elem = $(e.currentTarget);
            var customMessage = $(e.currentTarget).attr('data-confirmMessage');
            var subMessage = $(e.currentTarget).attr('data-confirmSubMessage');
            var icon = $(e.currentTarget).attr('data-confirmIcon');
            ips.ui.alert.show({
                type: 'confirm',
                icon: (icon) ? icon : 'warn',
                message: (customMessage) ? customMessage : ips.getString('generic_confirm'),
                subText: (subMessage) ? subMessage : '',
                callbacks: {
                    ok: function() {
                        window.location = elem.attr('href') + '&wasConfirmed=1';
                    }
                }
            });
        },
        _fixMissingLazyLoadItems: function(container) {
            var content = $(container).find(ips.utils.lazyLoad.contentSelector).not('.ipsHide');
            var initialLength = content.length;
            var toObserve = [];
            if (!initialLength) {
                return;
            }
            content.each(function() {
                var closest = $(this).closest('[data-ipsLazyLoad], [data-controller^="core.front.core.lightboxedImages"]');
                if (!closest.length) {
                    if (ips.getSetting('lazyLoadEnabled')) {
                        ips.utils.lazyLoad.observe(this);
                    } else {
                        ips.utils.lazyLoad.loadContent(this);
                    }
                }
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.autoSizeIframe', {
        _origin: ips.utils.url.getOrigin(),
        _embedId: '',
        _iframe: null,
        _border: {
            vertical: 0,
            horizontal: 0
        },
        initialize: function() {
            if (!this.scope.is('iframe')) {
                return;
            }
            this.on(window, 'message', this.receiveMessage);
            this.on(document, 'breakpointChange', this.breakpointChange);
            this.setup();
        },
        setup: function() {
            this._lastDims = {
                height: 0,
                width: 0
            };
            var iframe = this.scope.get(0);
            iframe.style.overflow = 'hidden';
            this._getBorderAdjustment();
            if (this.scope.height() > 800) {
                this.scope.css({
                    height: '800px'
                });
            }
            this._iframe = iframe.contentWindow;
            this._embedId = 'embed' + parseInt(Math.random() * (10000000000 - 1) + 1);
            this.scope.attr('data-embedId', this._embedId);
            if (!window.postMessage || !window.JSON.parse) {
                this.scope.css({
                    height: '400px'
                });
                Debug.error("Can't resize embed: " + this._embedId);
                return;
            }
            this._startReadyTimeout();
        },
        _startReadyTimeout: function() {
            this._readyTimeout = setInterval(_.bind(function() {
                this._postMessage('ready');
            }, this), 100);
            setTimeout(_.bind(function() {
                this._stopReadyTimeout();
            }, this), 10000);
        },
        _stopReadyTimeout: function() {
            if (this._readyTimeout !== null) {
                Debug.log("Stopped posting to embed " + this._embedId);
                clearInterval(this._readyTimeout);
                this._readyTimeout = null;
            }
        },
        destruct: function() {
            Debug.log('Destruct autoSizeIframe ' + this._embedId);
            this._stopReadyTimeout();
            this._postMessage('stop');
        },
        receiveMessage: function(e) {
            if (e.originalEvent.origin !== this._origin) {
                return;
            }
            try {
                var pmData = JSON.parse(e.originalEvent.data);
                var method = pmData.method;
            } catch (err) {
                Debug.log("Invalid data");
                return;
            }
            if (_.isUndefined(pmData.embedId) || pmData.embedId !== this._embedId) {
                return;
            }
            this._stopReadyTimeout();
            if (method && !_.isUndefined(this[method])) {
                this[method].call(this, pmData);
            }
        },
        _postMessage: function(method, obj) {
            Debug.log("Posting to iframe " + this._embedId);
            this._iframe.postMessage(JSON.stringify(_.extend(obj || {}, {
                method: method,
                embedId: this._embedId
            })), this._origin);
        },
        _getBorderAdjustment: function() {
            this._border.vertical = parseInt(this.scope.css('border-top-width')) + parseInt(this.scope.css('border-bottom-width'));
            this._border.horizontal = parseInt(this.scope.css('border-left-width')) + parseInt(this.scope.css('border-right-width'));
        },
        breakpointChange: function(e, data) {
            this._postMessage('responsiveState', {
                currentIs: data.curBreakName
            });
        },
        dialog: function(data) {
            var options = ips.ui.getAcceptedOptions('dialog');
            var dialogOptions = {};
            _.each(options, function(opt) {
                if (!_.isUndefined(data.options['data-ipsdialog-' + opt.toLowerCase()])) {
                    dialogOptions[opt] = data.options['data-ipsdialog-' + opt.toLowerCase()];
                }
            });
            if (_.isUndefined(dialogOptions['url'])) {
                dialogOptions['url'] = data.url;
            }
            var dialogRef = ips.ui.dialog.create(dialogOptions);
            dialogRef.show();
        },
        height: function(data) {
            if (this._lastDims.height !== data.height) {
                this.scope.css({
                    height: parseInt(data.height) + this._border.vertical + 'px'
                });
                this._postMessage('setDimensions', {
                    height: parseInt(data.height)
                });
                this._lastDims.height = data.height;
            }
        },
        dims: function(data) {
            if (parseInt(this._lastDims.height) !== parseInt(data.height) || this._lastDims.width !== data.width) {
                this.scope.css({
                    height: parseInt(data.height) + this._border.vertical + 'px',
                    maxWidth: (data.width.toString().indexOf('%') == -1) ? parseInt(data.width) + this._border.horizontal + 'px' : '100%'
                });
                this._lastDims.height = data.height;
                this._lastDims.width = data.width;
            }
        },
        ok: function() {
            this._stopReadyTimeout();
            this.scope.addClass('ipsEmbed_finishedLoading');
            this._postMessage('responsiveState', {
                currentIs: ips.utils.responsive.getCurrentKey()
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.comment', {
        _quoteData: null,
        _commentContents: '',
        _quotingDisabled: false,
        _quoteTimeout: null,
        _isEditing: false,
        _clickHandler: null,
        initialize: function() {
            this.on('click', '[data-action="editComment"]', this.editComment);
            this.on('click', '[data-action="cancelEditComment"]', this.cancelEditComment);
            this.on('click', '[data-action="deleteComment"]', this.deleteComment);
            this.on('click', '[data-action="approveComment"]', this.approveComment);
            this.on('click', '[data-action="quoteComment"]', this.quoteComment);
            this.on('click', '[data-action="multiQuoteComment"]', this.multiQuoteComment);
            this.on('click', '[data-action="rateReview"]', this.rateReview);
            this.on('submit', 'form', this.submitEdit);
            this.on('change', 'input[type="checkbox"][data-role="moderation"]', this.commentCheckbox);
            this.on('mouseup touchend touchcancel selectionchange', '[data-role="commentContent"]', this.inlineQuote);
            this.on('click', '[data-action="quoteSelection"]', this.quoteSelection);
            this.on('openDialog', '[data-role="shareComment"]', this.shareCommentDialog);
            this.on('submitDialog', '[data-action="recommendComment"]', this.recommendComment);
            this.on('click', '[data-action="unrecommendComment"]', this.unrecommendComment);
            this.on('setMultiQuoteEnabled.comment setMultiQuoteDisabled.comment', this.setMultiQuote);
            this.on('disableQuoting.comment', this.disableQuoting);
            this.on(document, 'getEditFormLoading.comment saveEditCommentLoading.comment ' + 'deleteCommentLoading.comment', this.commentLoading);
            this.on(document, 'getEditFormDone.comment saveEditCommentDone.comment ' + 'deleteCommentDone.comment', this.commentDone);
            this.on(document, 'getEditFormDone.comment', this.getEditFormDone);
            this.on(document, 'getEditFormError.comment', this.getEditFormError);
            this.on(document, 'saveEditCommentDone.comment', this.saveEditCommentDone);
            this.on(document, 'saveEditCommentError.comment', this.saveEditCommentError);
            this.on(document, 'deleteCommentDone.comment', this.deleteCommentDone);
            this.on(document, 'deleteCommentError.comment', this.deleteCommentError);
            this.on(document, 'unrecommendCommentDone.comment', this.unrecommendCommentDone);
            this.on(document, 'unrecommendCommentError.comment', this.unrecommendCommentError);
            this.on(document, 'approveCommentLoading.comment', this.approveCommentLoading);
            this.on(document, 'approveCommentDone.comment', this.approveCommentDone);
            this.on(document, 'approveCommentError.comment', this.approveCommentError);
            this.setup();
        },
        setup: function() {
            this._commentID = this.scope.attr('data-commentID');
            this._clickHandler = _.bind(this._hideQuoteTooltip, this);
            const fragment = window.location.hash;
            const match = fragment.match(/#find(Review|Comment)-(\d+)/);
            if (match) {
                const type = match[1]
                const commentId = match[2];
                const elementId = `find${type}-${commentId}`;
                const element = document.getElementById(elementId);
                if (!element) {
                    var currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('do', `find${type}`);
                    currentUrl.searchParams.set(type.toLowerCase(), commentId);
                    window.location.href = currentUrl;
                }
            }
            document.querySelectorAll("a.ipsComment_ellipsis").forEach(function(aTag) {
                var aTagId = aTag.id;
                var ul = document.getElementById(aTagId + "_menu");
                if (ul && ul.children.length === 0) {
                    aTag.style.display = 'none';
                }
            });
        },
        destroy: function() {},
        inlineQuote: function(e) {
            var self = this;
            var quoteButton = this.scope.find('[data-action="quoteComment"]');
            if (this._isEditing || this._quotingDisabled || !quoteButton.length) {
                return;
            }
            clearInterval(this._quoteTimeout);
            this._quoteTimeout = setInterval(function() {
                self._checkQuoteStatus(e);
            }, 400);
        },
        recommendComment: function(e, data) {
            var commentHtml = $('<div>' + data.response.comment + '</div>').find('[data-controller="core.front.core.comment"]').html();
            this.scope.html(commentHtml).closest('.ipsComment').addClass('ipsComment_popular');
            $(document).trigger('contentChange', [this.scope]);
            if (ips.utils.db.isEnabled()) {
                this.scope.find('[data-action="multiQuoteComment"]').removeClass('ipsHide');
            }
            this.trigger('refreshRecommendedComments', {
                scroll: true,
                recommended: data.response.recommended
            });
        },
        unrecommendComment: function(e, data) {
            e.preventDefault();
            var url = $(e.currentTarget).attr('href');
            this.trigger('unrecommendComment.comment', {
                url: url,
                commentID: this._commentID
            });
        },
        unrecommendCommentDone: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            var commentHtml = $('<div>' + data.comment + '</div>').find('[data-controller="core.front.core.comment"]').html();
            this.scope.html(commentHtml).closest('.ipsComment').removeClass('ipsComment_popular').find('.ipsComment_popularFlag').remove();
            ips.ui.flashMsg.show(ips.getString('commentUnrecommended'));
            this.trigger('removeRecommendation', {
                commentID: data.unrecommended
            });
        },
        unrecommendCommentError: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            window.reload();
        },
        _checkQuoteStatus: function() {
            var selectedText = ips.utils.selection.getSelectedText('[data-role="commentContent"]', this.scope.find('[data-role="commentContent"]').parent());
            var ancestor = ips.utils.selection.getCommonAncestor();
            if (selectedText.trim() == '') {
                this._hideQuoteTooltip();
                return;
            }
            if (ancestor && ancestor.closest('.ipsCode').length) {
                selectedText = "<pre class='ipsCode prettyprint'>" + selectedText + "</pre>";
            } else if (!selectedText.startsWith('<')) {
                selectedText = '<p>' + selectedText + '</p>';
            }
            if (this._selectedText == selectedText) {
                return;
            }
            this._selectedText = selectedText;
            this._showQuoteTooltip();
        },
        _showQuoteTooltip: function() {
            var selection = ips.utils.selection.getSelection();
            var range = ips.utils.selection.getRange(this.scope.find('[data-role="commentContent"]'));
            var tooltip = this.scope.find('[data-role="inlineQuoteTooltip"]');
            var scopeOffset = this.scope.offset();
            var position = {
                left: 0,
                top: 0
            };
            if (range === false || !_.isObject(range) || _.isUndefined(range.type)) {
                Debug.log("No selection found");
                return;
            }
            if (!tooltip.length) {
                this.scope.append(ips.templates.render('core.selection.quote', {
                    direction: 'bottom'
                }));
                tooltip = this.scope.find('[data-role="inlineQuoteTooltip"]');
                $(document).on('click dblclick', this._clickHandler);
            }
            if (range.type === 'outside') {
                var boundingBox = range.range.getBoundingClientRect();
                var offset = this.scope.offset();
                position.left = boundingBox.left + (boundingBox.width / 2) + $(window).scrollLeft() - offset.left;
                position.top = boundingBox.top + boundingBox.height + $(window).scrollTop() - offset.top;
            } else {
                var cloneRange = range.range.cloneRange();
                var invisibleElement = document.createElement('span');
                invisibleElement.appendChild(document.createTextNode('\ufeff'));
                cloneRange.collapse(false);
                cloneRange.insertNode(invisibleElement);
                var tmpPosition = ips.utils.position.getElemPosition($(invisibleElement));
                position.left = tmpPosition.absPos.left - scopeOffset.left;
                position.top = tmpPosition.absPos.top - scopeOffset.top + 25;
                invisibleElement.parentNode.removeChild(invisibleElement);
            }
            var tooltipSize = {
                width: tooltip.show().outerWidth(),
                height: tooltip.show().outerHeight()
            };
            var leftAdjustment = ips.utils.events.isTouchDevice() ? tooltipSize.width : (tooltipSize.width / 2);
            tooltip.css({
                position: 'absolute',
                left: Math.round(position.left - leftAdjustment) + 'px',
                top: Math.round(position.top) + 'px',
                zIndex: ips.ui.zIndex()
            });
            if (!tooltip.is(':visible')) {
                tooltip.hide().fadeIn('fast');
            } else {
                tooltip.show();
            }
        },
        _hideQuoteTooltip: function() {
            $(document).off('click dblclick', this._clickHandler);
            clearInterval(this._quoteTimeout);
            this.scope.find('[data-role="inlineQuoteTooltip"]').fadeOut('fast');
            this._selectedText = '';
        },
        quoteSelection: function(e) {
            e.preventDefault();
            this._getQuoteData();
            if (this._selectedText) {
                this.trigger('quoteComment.comment', {
                    userid: this._quoteData.userid,
                    username: this._quoteData.username,
                    timestamp: this._quoteData.timestamp,
                    contentapp: this._quoteData.contentapp,
                    contenttype: this._quoteData.contenttype,
                    contentclass: this._quoteData.contentclass,
                    contentid: this._quoteData.contentid,
                    contentcommentid: this._quoteData.contentcommentid,
                    quoteHtml: this._selectedText
                });
            }
            this._hideQuoteTooltip();
        },
        commentCheckbox: function(e) {
            var checked = $(e.currentTarget).is(':checked');
            this.scope.closest('.ipsComment').toggleClass('ipsComment_selected', checked);
            this.trigger('checkedComment.comment', {
                commentID: this._commentID,
                actions: $(e.currentTarget).attr('data-actions'),
                checked: checked
            });
        },
        disableQuoting: function() {
            this._quotingDisabled = true;
            this.scope.find('[data-ipsQuote-editor]').remove();
        },
        rateReview: function(e) {
            e.preventDefault();
            var self = this;
            ips.getAjax()($(e.currentTarget).attr('href')).done(function(response) {
                var content = $("<div>" + response + "</div>");
                self.scope.html(content.find('[data-controller="core.front.core.comment"]').contents());
                $(document).trigger('contentChange', [self.scope]);
            }).fail(function(err) {
                window.location = $(e.currentTarget).attr('href');
            });
        },
        shareCommentDialog: function(e, data) {
            if (data.dialog) {
                data.dialog.find('input[type="text"]').get(0).select();
            }
        },
        setMultiQuote: function(e, data) {
            var selector = '[data-commentApp="' + data.contentapp + '"]';
            selector += '[data-commentType="' + data.contenttype + '"]';
            selector += '[data-commentID="' + data.contentcommentid + '"]';
            if (this.scope.is(selector)) {
                if (!_.isNull(e) && e.type == 'setMultiQuoteEnabled') {
                    this.scope.find('[data-action="multiQuoteComment"]').removeClass('ipsButton_simple').addClass('ipsButton_alternate').attr('data-mqActive', true).html(ips.templates.render('core.posts.multiQuoteOn'));
                } else if (_.isNull(e) || e.type == 'setMultiQuoteDisabled') {
                    this.scope.find('[data-action="multiQuoteComment"]').addClass('ipsButton_simple').removeClass('ipsButton_alternate').removeAttr('data-mqActive').html(ips.templates.render('core.posts.multiQuoteOff'));
                }
            }
        },
        quoteComment: function(e) {
            e.preventDefault();
            if (!this._getQuoteData()) {
                Debug.error("Couldn't get quote data");
                return;
            }
            var html = this._prepareQuote($('<div/>').html(this.scope.find('[data-role="commentContent"]').html()));
            this.trigger('quoteComment.comment', {
                userid: this._quoteData.userid,
                username: this._quoteData.username,
                timestamp: this._quoteData.timestamp,
                contentapp: this._quoteData.contentapp,
                contenttype: this._quoteData.contenttype,
                contentclass: this._quoteData.contentclass,
                contentid: this._quoteData.contentid,
                contentcommentid: this._quoteData.contentcommentid,
                quoteHtml: html.html()
            });
        },
        multiQuoteComment: function(e) {
            e.preventDefault();
            if (!this._getQuoteData()) {
                Debug.error("Couldn't get quote data");
                return;
            }
            var button = $(e.currentTarget);
            var mqActive = button.attr('data-mqActive');
            var html = this._prepareQuote($('<div/>').html(this.scope.find('[data-role="commentContent"]').html()));
            this.trigger((mqActive) ? 'removeMultiQuote.comment' : 'addMultiQuote.comment', {
                userid: this._quoteData.userid,
                username: this._quoteData.username,
                timestamp: this._quoteData.timestamp,
                contentapp: this._quoteData.contentapp,
                contenttype: this._quoteData.contenttype,
                contentclass: this._quoteData.contentclass,
                contentid: this._quoteData.contentid,
                contentcommentid: this._quoteData.contentcommentid,
                quoteHtml: html.html(),
                button: button.attr('data-mqId')
            });
            if (mqActive) {
                button.removeClass('ipsButton_alternate').addClass('ipsButton_simple').removeAttr('data-mqActive').html(ips.templates.render('core.posts.multiQuoteOff'));
            } else {
                button.removeClass('ipsButton_simple').addClass('ipsButton_alternate').attr('data-mqActive', true).html(ips.templates.render('core.posts.multiQuoteOn'));
            }
        },
        editComment: function(e) {
            e.preventDefault();
            this._commentContents = this.scope.find('[data-role="commentContent"]').html();
            var url = $(e.currentTarget).attr('href');
            this.trigger('getEditForm.comment', {
                url: url,
                commentID: this._commentID
            });
        },
        cancelEditComment: function(e) {
            e.preventDefault();
            var self = this;
            ips.ui.alert.show({
                type: 'verify',
                icon: 'warn',
                message: ips.getString('cancel_edit_confirm'),
                subText: '',
                buttons: {
                    yes: ips.getString('yes'),
                    no: ips.getString('no')
                },
                callbacks: {
                    yes: function() {
                        ips.ui.editor.destruct(self.scope.find('[data-ipseditor]'));
                        self.scope.find('[data-role="commentContent"]').html(self._commentContents);
                        self.scope.find('[data-role="commentControls"], [data-action="expandTruncate"]').show();
                        self.scope.find('[data-action="editComment"]').parent('li').show();
                        $(document).trigger('contentChange', [self.scope]);
                    }
                }
            });
        },
        submitEdit: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var instance;
            var empty = false;
            for (instance in CKEDITOR.instances) {
                CKEDITOR.instances[instance].updateElement();
            }
            if (typeof CKEDITOR.instances['comment_value'] !== 'undefined') {
                var postBody = CKEDITOR.instances['comment_value'].editable().getData().replace(/&nbsp;/g, '').trim();
                if (postBody == '' || postBody.match(/^<p>(<p>|<\/p>|\s)*<\/p>$/)) {
                    ips.ui.alert.show({
                        type: 'alert',
                        icon: 'warn',
                        message: ips.getString('cantEmptyEdit'),
                        subText: ips.getString('cantEmptyEditDesc')
                    });
                    return;
                }
            }
            var form = this.scope.find('form');
            var url = form.attr('action');
            var data = form.serialize();
            form.find('[data-action="cancelEditComment"]').remove();
            form.find('[type="submit"]').prop('disabled', true).text(ips.getString('saving'));
            this.trigger('saveEditComment.comment', {
                form: data,
                url: url,
                commentID: this._commentID
            });
        },
        commentLoading: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            var commentLoading = this.scope.find('[data-role="commentLoading"]');
            commentLoading.removeClass('ipsHide').find('.ipsLoading').removeClass('ipsLoading_noAnim');
            ips.utils.anim.go('fadeIn', commentLoading);
        },
        commentDone: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            this.scope.find('[data-role="commentLoading"]').addClass('ipsHide').find('.ipsLoading').addClass('ipsLoading_noAnim');
        },
        getEditFormDone: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            var self = this;
            var showForm = _.once(function() {
                self._isEditing = true;
                self.scope.find('[data-action="expandTruncate"], [data-role="commentControls"]').hide();
                self.scope.find('[data-action="editComment"]').parent('li').hide();
                self.scope.find('[data-role="commentContent"]').html(data.response);
                $(document).trigger('contentChange', [self.scope.find('[data-role="commentContent"]')]);
            });
            var elemPosition = ips.utils.position.getElemPosition(this.scope);
            var windowScroll = $(window).scrollTop();
            var viewHeight = $(window).height();
            if (elemPosition.absPos.top < windowScroll || elemPosition.absPos.top > (windowScroll + viewHeight)) {
                $('html, body').animate({
                    scrollTop: elemPosition.absPos.top + 'px'
                }, function() {
                    showForm();
                });
            } else {
                showForm();
            }
        },
        getEditFormError: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            window.location = data.url;
        },
        saveEditCommentDone: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            ips.ui.editor.destruct(this.scope.find('[data-ipseditor]'));
            this._isEditing = false;
            this.scope.find('[data-role="commentContent"]').replaceWith($('<div>' + data.response + '</div>').find('[data-role="commentContent"]'));
            this.scope.trigger('refreshContent');
            this.scope.find('[data-action="expandTruncate"], [data-role="commentControls"]').show();
            this.scope.find('[data-action="editComment"]').parent('li').show();
            $(document).trigger('contentChange', [this.scope]);
        },
        saveEditCommentError: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            ips.ui.alert.show({
                type: 'alert',
                icon: 'warn',
                message: ips.getString('editCommentError'),
            });
        },
        approveComment: function(e) {
            e.preventDefault();
            var url = $(e.currentTarget).attr('href');
            this.trigger('approveComment.comment', {
                url: url,
                commentID: this._commentID
            });
        },
        approveCommentLoading: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            this.scope.find('[data-role="commentControls"]').addClass('ipsFaded').find('[data-action="approveComment"]').addClass('ipsButton_disabled').text(ips.getString('commentApproving'));
        },
        approveCommentDone: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            var commentHtml = $('<div>' + data.response + '</div>').find('[data-controller="core.front.core.comment"]').html();
            this.scope.html(commentHtml).removeClass('ipsModerated').closest('.ipsComment').removeClass('ipsModerated');
            $(document).trigger('contentChange', [this.scope]);
            if (ips.utils.db.isEnabled()) {
                this.scope.find('[data-action="multiQuoteComment"]').removeClass('ipsHide');
            }
            ips.ui.flashMsg.show(ips.getString('commentApproved'));
        },
        approveCommentError: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            window.location = data.url;
        },
        deleteComment: function(e) {
            e.preventDefault();
            var self = this;
            var url = $(e.currentTarget).attr('href');
            var commentData = this._getQuoteData();
            var eventData = _.extend(commentData, {
                url: url,
                commentID: this._commentID
            });
            ips.ui.alert.show({
                type: 'confirm',
                icon: 'warn',
                message: ips.getString('delete_confirm'),
                callbacks: {
                    ok: function() {
                        self.trigger('deleteComment.comment', eventData);
                    }
                }
            });
        },
        deleteCommentDone: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            var deleteLink = this.scope.find('[data-action="deleteComment"]');
            var toHide = null;
            var toShow = null;
            if (deleteLink.attr('data-hideOnDelete')) {
                toHide = this.scope.find(deleteLink.attr('data-hideOnDelete'));
            } else {
                toHide = this.scope.closest('article');
            }
            toHide.animationComplete(function() {
                toHide.remove();
            });
            ips.utils.anim.go('fadeOutDown', toHide);
            if (deleteLink.attr('data-updateOnDelete')) {
                $(deleteLink.attr('data-updateOnDelete')).text(parseInt($(deleteLink.attr('data-updateOnDelete')).text()) - 1);
            }
            if (deleteLink.attr('data-showOnDelete')) {
                toShow = this.scope.find(deleteLink.attr('data-showOnDelete'));
                ips.utils.anim.go('fadeIn', toShow);
            }
            this.trigger('deletedComment.comment', {
                commentID: this._commentID,
                response: data.response
            });
        },
        deleteCommentError: function(e, data) {
            if (data.commentID != this._commentID) {
                return;
            }
            window.location = data.url;
        },
        _prepareQuote: function(html) {
            if (html.find('blockquote.ipsQuote') && html.find('blockquote.ipsQuote').parent() && html.find('blockquote.ipsQuote').parent().get(0) && html.find('blockquote.ipsQuote').parent().get(0).tagName == 'DIV' && html.find('blockquote.ipsQuote').siblings().length == 0) {
                var div = html.find('blockquote.ipsQuote').closest('div');
                div.next('p').find("br:first-child").remove();
                div.remove();
            } else {
                html.find('blockquote.ipsQuote').remove();
            }
            html.find('.ipsStyle_spoilerFancy,.ipsStyle_spoiler').replaceWith(ips.templates.render('core.posts.quotedSpoiler'));
            html.find("[data-excludequote]").remove();
            html.find('.ipsQuote_citation').remove();
            html.find('[data-quote-value]').each(function() {
                $(this).replaceWith('<p>' + $(this).attr('data-quote-value') + '</p>');
            });
            return html;
        },
        _getQuoteData: function() {
            if (!this._quoteData) {
                try {
                    this._quoteData = $.parseJSON(this.scope.attr('data-quoteData'));
                    return this._quoteData;
                } catch (err) {
                    Debug.log("Couldn't parse quote data");
                    return {};
                }
            }
            return this._quoteData;
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.commentFeed', {
        _overlay: null,
        _commentFeedID: 0,
        _newRepliesFlash: null,
        _maximumMultiQuote: 50,
        _pageParam: 'page',
        _seoPagination: false,
        _urlParams: {},
        _baseURL: '',
        _doneInitialState: false,
        _initialURL: '',
        _pollingEnabled: true,
        _pollingActive: false,
        _pollingPaused: false,
        _initialPoll: 60000,
        _currentPoll: 60000,
        _decay: 20000,
        _maxInterval: (30 * 60) * 1000,
        _pollingTimeout: null,
        _pollAjax: null,
        _pollOnUnpaused: false,
        _notification: null,
        _lastSeenTotal: 0,
        initialize: function() {
            this._containerID = this.scope.closest('[data-commentsContainer]').length ? this.scope.closest('[data-commentsContainer]').attr('data-commentsContainer') : this.scope.identify().attr('id');
            this.on('submit', '[data-role="replyArea"]', this.quickReply);
            this.on('quoteComment.comment', this.quoteComment);
            this.on('addMultiQuote.comment', this.addMultiQuote);
            this.on('removeMultiQuote.comment deleteComment.comment', this.removeMultiQuote);
            this.on('click', '[data-action="filterClick"]', this.filterClick);
            this.on('menuItemSelected', '[data-role="signatureOptions"]', this.signatureOptions);
            this.on('editorCompatibility', this.editorCompatibility);
            this.on('checkedComment.comment', this.checkedComment);
            this._boundMQ = _.bind(this.doMultiQuote, this);
            this._boundCMQ = _.bind(this.clearMultiQuote, this);
            $(document).on('click', '[data-role="multiQuote_' + this._containerID + '"]', this._boundMQ);
            $(document).on('click', '[data-action="clearQuoted_' + this._containerID + '"]', this._boundCMQ);
            $(document).on('moderationSubmitted', this.clearLocalStorage);
            this.on('paginationClicked paginationJump', this.paginationClick);
            this.on(document, 'addToCommentFeed', this.addToCommentFeed);
            this.on('deletedComment.comment', this.deletedComment);
            this.on(document, 'click', '[data-action="loadNewPosts"]', this.loadNewPosts);
            this.on(window, 'historychange', this.stateChange);
            this.on(document, "socket.new_comment", this.handleSocketCommentTrigger);
            this.setup();
        },
        setup: function() {
            var self = this;
            var replyForm = this.scope.find('[data-role="replyArea"] form');
            this._commentFeedID = this.scope.attr('data-feedID');
            this._urlParams = this._getUrlParams();
            this._baseURL = this.scope.attr('data-baseURL');
            this._initialURL = window.location.href;
            this._currentPage = ips.utils.url.getPageNumber(this._pageParam);
            this._urlParams[this._pageParam] = this._currentPage;
            if (this._baseURL.match(/\?/)) {
                if (this._baseURL.slice(-1) != '?') {
                    this._baseURL += '&';
                }
            } else {
                this._baseURL += '?';
            }
            if (replyForm.attr('data-noAjax')) {
                this._pollingEnabled = false;
            }
            if (!_.isUndefined(this.scope.attr('data-lastPage')) && this._pollingEnabled) {
                this._startPolling();
            }
            $(document).ready(function() {
                self._setUpMultiQuote();
                self._findCheckedComments();
            });
        },
        clearLocalStorage: function() {
            ips.utils.db.remove('moderation', $(document).find("[data-feedID]").attr('data-feedID'));
        },
        destroy: function() {
            $(document).off('click', '[data-role="multiQuote_' + this._containerID + '"]', this._boundMQ);
            $(document).off('click', '[data-action="clearQuoted_' + this._containerID + '"]', this._boundCMQ);
            this._stopPolling();
        },
        _getUrlParams: function() {
            var sort = this._getSortValue();
            var obj = {
                sortby: sort.by || '',
                sortdirection: sort.order || '',
            };
            obj[this._pageParam] = ips.utils.url.getPageNumber(this._pageParam) || 1;
            return obj;
        },
        _getSortValue: function() {
            return {
                by: '',
                order: ''
            };
        },
        stateChange: function() {
            const lastChange = ips.utils.history.getLastChangeType()
            if (lastChange && lastChange !== 'commentFeed') {
                return
            }
            const state = {
                data: ips.utils.history.getState('commentFeed'),
                url: window.location.href
            }
            if ((state.data.controller !== this.controllerID || state.data.feedID !== this._commentFeedID)) {
                if (state.data.controller === undefined && state.url === this._initialURL) {
                    Debug.log("No controller state, but state URL matched initial URL");
                } else {
                    return;
                }
            }
            this._urlParams = state.data;
            ips.utils.analytics.trackPageView(state.url);
            if (this._initialURL === state.url) {
                this._getResults(state.url);
            } else {
                this._getResults();
            }
        },
        _getResults: function(url) {
            const fetchURL = url || this._baseURL + this._getURL();
            this._setLoading(true);
            ips.getAjax()(fetchURL, {
                showLoading: true
            }).done(_.bind(this._getResultsDone, this)).fail(_.bind(this._getResultsFail, this)).always(_.bind(this._getResultsAlways, this));
        },
        _getResultsDone: function(response) {
            var tmpElement = $('<div>' + response + '</div>').find('[data-feedID="' + this.scope.attr('data-feedID') + '"]');
            var newContents = tmpElement.html();
            tmpElement.remove();
            this.cleanContents();
            this.scope.hide().html(newContents);
            ips.utils.anim.go('fadeIn', this.scope);
            this._overlay.hide();
            var currentPageNo = ips.utils.url.getPageNumber(this._pageParam, window.location.href);
            var lastPageNo = this.scope.find('li.ipsPagination_last > a').first().attr('data-page');
            if (currentPageNo != lastPageNo) {
                this.scope.removeAttr('data-lastPage');
                this._stopPolling();
            } else {
                this.scope.attr('data-lastPage', true);
                if (this._pollingEnabled) {
                    this._currentPoll = this._initialPoll;
                    this._startPolling();
                }
            }
            this._setUpMultiQuote();
            $(document).trigger('contentChange', [this.scope]);
            this._findCheckedComments();
        },
        _getResultsFail: function(jqXHR, textStatus, errorThrown) {
            if (Debug.isEnabled()) {
                Debug.error("Ajax request failed (" + textStatus + "): " + errorThrown);
                Debug.error(jqXHR.responseText);
            } else {
                window.location = this._baseURL + this._getURL();
            }
        },
        _getResultsAlways: function() {},
        _setLoading: function(status) {
            var scope = this.scope;
            var self = this;
            var commentFeed = this.scope.find('[data-role="commentFeed"]');
            if (status) {
                if (!this._overlay) {
                    this._overlay = $('<div/>').addClass('ipsLoading').hide();
                    ips.getContainer().append(this._overlay);
                }
                var dims = ips.utils.position.getElemDims(commentFeed);
                var position = ips.utils.position.getElemPosition(commentFeed);
                this._overlay.show().css({
                    left: position.viewportOffset.left + 'px',
                    top: position.viewportOffset.top + $(document).scrollTop() + 'px',
                    width: dims.width + 'px',
                    height: dims.height + 'px',
                    position: 'absolute',
                    zIndex: ips.ui.zIndex()
                });
                commentFeed.animate({
                    opacity: "0.5"
                });
                var elemPosition = ips.utils.position.getElemPosition(this.scope);
                $('html, body').animate({
                    scrollTop: elemPosition.absPos.top + 'px'
                });
            } else {}
        },
        paginationClick: function(e, data) {
            data.originalEvent.preventDefault();
            if (data.pageNo !== this._urlParams[this._pageParam]) {
                var urlObj = ips.utils.url.getURIObject(data.href);
                var queryKey = urlObj.queryKey;
                if (_.isUndefined(queryKey[this._pageParam])) {
                    queryKey[this._pageParam] = data.pageNo;
                }
                this._seoPagination = data.seoPagination;
                this._updateURL(queryKey);
            }
        },
        _updateURL: function(newParams) {
            _.extend(this._urlParams, newParams);
            var tmpStateData = _.extend(_.clone(this._urlParams), {
                controller: this.controllerID,
                feedID: this._commentFeedID
            });
            var newUrl = this._baseURL + this._getURL();
            if (newUrl.slice(-1) === '?') {
                newUrl = newUrl.substring(0, newUrl.length - 1);
            }
            if (this._seoPagination === true) {
                newUrl = ips.utils.url.pageParamToPath(newUrl, this._pageParam, newParams[this._pageParam]);
            }
            ips.utils.history.pushState(tmpStateData, 'commentFeed', newUrl);
        },
        _getURL: function() {
            var tmpUrlParams = {};
            for (var i in this._urlParams) {
                if (this._urlParams[i] != '' && i != 'controller' && i != 'feedID' && i != 'bypassState' && (i != 'page' || (i == 'page' && this._urlParams[i] > 1))) {
                    tmpUrlParams[i] = this._urlParams[i];
                }
            }
            return $.param(tmpUrlParams);
        },
        editorCompatibility: function(e, data) {
            if (!data.compatible) {
                this.triggerOn('core.front.core.comment', 'disableQuoting.comment');
            }
        },
        checkedComment: function(e, data) {
            var dataStore = ips.utils.db.get('moderation', this._commentFeedID) || {};
            if (data.checked) {
                if (_.isUndefined(dataStore[data.commentID])) {
                    dataStore[data.commentID] = data.actions;
                }
            } else {
                delete dataStore[data.commentID];
            }
            if (_.size(dataStore)) {
                ips.utils.db.set('moderation', this._commentFeedID, dataStore);
            } else {
                ips.utils.db.remove('moderation', this._commentFeedID);
            }
        },
        _findCheckedComments: function() {
            if (!this.scope.find('input[type="checkbox"]').length) {
                return;
            }
            var dataStore = ips.utils.db.get('moderation', this._commentFeedID) || {};
            var self = this;
            var pageAction = this.scope.find('[data-ipsPageAction]');
            if (_.size(dataStore)) {
                var sizeOtherPage = 0;
                _.each(dataStore, function(val, key) {
                    if (self.scope.find('[data-commentID="' + key + '"]').length) {
                        self.scope.find('[data-commentID="' + key + '"] input[type="checkbox"][data-role="moderation"]').attr('checked', true).trigger('change');
                    } else {
                        sizeOtherPage++;
                        pageAction.trigger('addManualItem.pageAction', {
                            id: 'multimod[' + key + ']',
                            actions: val
                        });
                    }
                });
                if (this.scope.find('[data-ipsAutoCheck]')) {
                    this.scope.find('[data-ipsAutoCheck]').trigger('setInitialCount.autoCheck', {
                        count: sizeOtherPage
                    });
                }
            }
        },
        signatureOptions: function(e, data) {
            data.originalEvent.preventDefault();
            if (data.selectedItemID == 'oneSignature') {
                this._ignoreSingleSignature($(e.currentTarget).attr('data-memberID'));
            } else {
                this._ignoreAllSignatures();
            }
        },
        _ignoreAllSignatures: function() {
            var self = this;
            var url = ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=settings&do=toggleSigs';
            var signatures = this.scope.find('[data-role="memberSignature"]');
            signatures.slideUp();
            ips.getAjax()(url).done(function(response) {
                ips.ui.flashMsg.show(ips.getString('signatures_hidden'));
                signatures.remove();
            }).fail(function() {
                signatures.show();
                ips.ui.alert.show({
                    type: 'alert',
                    icon: 'warn',
                    message: ips.getString('signatures_error'),
                    callbacks: {}
                });
            });
        },
        _ignoreSingleSignature: function(memberID) {
            var self = this;
            var url = ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=ignore&do=ignoreType&type=signatures';
            var signatures = this.scope.find('[data-role="memberSignature"]').find('[data-memberID="' + memberID + '"]').closest('[data-role="memberSignature"]');
            signatures.slideUp();
            ips.getAjax()(url, {
                data: {
                    member_id: parseInt(memberID)
                }
            }).done(function(response) {
                ips.ui.flashMsg.show(ips.getString('single_signature_hidden'));
                signatures.remove();
            }).fail(function() {
                signatures.show();
                ips.ui.alert.show({
                    type: 'alert',
                    icon: 'warn',
                    message: ips.getString('single_signature_error'),
                    callbacks: {}
                });
            });
        },
        filterClick: function(e) {
            e.preventDefault();
            var urlObj = ips.utils.url.getURIObject($(e.target).attr('href'));
            var queryKey = urlObj.queryKey;
            this._updateURL(queryKey);
        },
        quoteComment: function(e, data) {
            ips.ui.editor.getObjWithInit(this.scope.find('[data-role="replyArea"] [data-ipsEditor]'), function(editor) {
                editor.insertQuotes([data]);
            });
        },
        windowBlur: function(e) {
            if (this._pollingEnabled) {
                Debug.log('Window blurred, pausing polling...');
                this._pollingPaused = true;
            }
        },
        windowFocus: function(e) {
            if (this._pollingEnabled && this._pollingPaused) {
                Debug.log('Window focused...');
                this._pollingPaused = false;
                if (this._pollOnUnpaused) {
                    this._pollOnUnpaused = false;
                    this.pollForNewReplies();
                }
            }
        },
        handleSocketCommentTrigger: function() {
            if (!_.isUndefined(this.scope.attr('data-lastPage')) && this._pollingEnabled) {
                this.pollForNewReplies();
            }
        },
        _startPolling: function() {
            var self = this;
            this._pollingActive = true;
            Debug.log('Starting polling with interval ' + (this._currentPoll / 1000) + 's');
            this._pollingTimeout = setTimeout(function() {
                self.pollForNewReplies();
            }, this._currentPoll);
        },
        _stopPolling: function() {
            this._pollingActive = false;
            if (this._pollingTimeout) {
                clearTimeout(this._pollingTimeout);
            }
            Debug.log("Stopped polling for new replies in comment feed.");
        },
        pollForNewReplies: function() {
            var self = this;
            var replyForm = this.scope.find('[data-role="replyArea"] form');
            var commentsOnThisPage = this.scope.find('[data-commentid]');
            if (!commentsOnThisPage.length) {
                return;
            }
            var lastSeenId = this._getLastSeenID(commentsOnThisPage);
            var type = $(commentsOnThisPage[commentsOnThisPage.length - 1]).attr('data-commentType');
            if (type.match(/-review$/)) {
                Debug.log("Polling disabled for reviews");
                this._stopPolling();
                return;
            }
            if (this._pollingPaused) {
                Debug.log('Window blurred, delaying poll until focused...');
                this._pollOnUnpaused = true;
                return;
            }
            if (this._pollAjax && !_.isUndefined(this._pollAjax.abort)) {
                this._pollAjax.abort();
            }
            this._pollAjax = ips.getAjax();
            this._pollAjax(replyForm.attr('action'), {
                dataType: 'json',
                data: 'do=checkForNewReplies&type=count&lastSeenID=' + lastSeenId + '&csrfKey=' + ips.getSetting('csrfKey'),
                type: 'post'
            }).done(function(response) {
                if (response.error && response.error == 'auto_polling_disabled') {
                    self._stopPolling();
                    return;
                }
                if (parseInt(response.count) > 0) {
                    self._currentPoll = self._initialPoll;
                    self._buildFlashMsg(response);
                    if (parseInt(response.totalCount) > parseInt(self._lastSeenTotal)) {
                        self._buildNotifications(response);
                        self._lastSeenTotal = parseInt(response.totalCount);
                    }
                } else {
                    if ((self._currentPoll + self._decay) < self._maxInterval) {
                        self._currentPoll += self._decay;
                    } else {
                        self._currentPoll = self._maxInterval;
                    }
                }
                if (!_.isUndefined(self.scope.attr('data-lastPage'))) {
                    self._startPolling();
                }
            });
        },
        _buildFlashMsg: function(response) {
            var html = '';
            var self = this;
            var itemsInFeed = this.scope.find('[data-commentid]').length;
            var spaceForMore = (parseInt(response.perPage) - itemsInFeed);
            if (parseInt(response.count) > spaceForMore) {
                html = ips.templates.render('core.postNotify.multipleSpillOver', {
                    text: ips.pluralize(ips.getString('newPostMultipleSpillOver'), [response.totalNewCount]),
                    canLoadNew: (spaceForMore > 0),
                    showFirstX: ips.pluralize(ips.getString('showFirstX'), [spaceForMore]),
                    spillOverUrl: response.spillOverUrl
                });
            } else if (parseInt(response.count) === 1 && !_.isUndefined(response.photo) && !_.isUndefined(response.name)) {
                html = ips.templates.render('core.postNotify.single', {
                    photo: response.photo,
                    text: ips.getString('newPostSingle', {
                        name: response.name
                    })
                });
            } else {
                html = ips.templates.render('core.postNotify.multiple', {
                    text: ips.pluralize(ips.getString('newPostMultiple'), [response.count])
                });
            }
            if ($('#elFlashMessage').is(':visible') && $('#elFlashMessage').find('[data-role="newPostNotification"]').length) {
                $('#elFlashMessage').find('[data-role="newPostNotification"]').replaceWith(html);
            } else {
                ips.ui.flashMsg.show(html, {
                    sticky: true,
                    position: 'bottom',
                    extraClasses: 'cPostFlash ipsPadding:half',
                    dismissable: function() {
                        self._stopPolling();
                    },
                    escape: false
                });
            }
        },
        _buildNotifications: function(response) {
            var self = this;
            var hiddenProp = ips.utils.events.getVisibilityProp();
            if (_.isUndefined(hiddenProp) || !document[hiddenProp] || !ips.utils.notification.hasPermission()) {
                return;
            }
            var notifyData = {
                onClick: function(e) {
                    try {
                        window.focus();
                    } catch (err) {}
                    self.loadNewPosts(e);
                }
            };
            if (self._notification) {
                self._notification.hide();
            }
            if (parseInt(response.count) === 1 && !_.isUndefined(response.photo) && !_.isUndefined(response.name)) {
                notifyData = _.extend(notifyData, {
                    title: ips.getString('notificationNewPostSingleTitle', {
                        name: response.name
                    }),
                    body: ips.getString('notificationNewPostSingleBody', {
                        name: response.name,
                        title: response.title
                    }),
                    icon: response.photo
                });
            } else {
                notifyData = _.extend(notifyData, {
                    title: ips.pluralize(ips.getString('notificationNewPostMultipleTitle'), [response.count]),
                    body: ips.pluralize(ips.getString('notificationNewPostMultipleBody', {
                        title: response.title
                    }), [response.count])
                });
            }
            self._notification = ips.utils.notification.create(notifyData);
            self._notification.show();
        },
        _importNewReplies: function() {
            var form = this.scope.find('[data-role="replyArea"] form');
            var commentsOnThisPage = this.scope.find('[data-commentid]');
            var _lastSeenID = this._getLastSeenID(commentsOnThisPage);
            var self = this;
            ips.getAjax()(form.attr('action'), {
                data: 'do=checkForNewReplies&type=fetch&lastSeenID=' + _lastSeenID + '&showing=' + commentsOnThisPage.length + '&csrfKey=' + ips.getSetting('csrfKey'),
                type: 'post'
            }).done(function(response) {
                if (commentsOnThisPage.length + parseInt(response.totalNewCount) > response.perPage) {
                    if (response.spillOverUrl) {
                        window.location = response.spillOverUrl;
                    } else {
                        window.location.reload();
                    }
                } else {
                    if (_.isArray(response.content)) {
                        _.each(response.content, function(item) {
                            self.trigger('addToCommentFeed', {
                                content: item,
                                feedID: self._commentFeedID,
                                resetEditor: false,
                                totalItems: response.totalCount
                            });
                        });
                    } else {
                        self.trigger('addToCommentFeed', {
                            content: response.content,
                            feedID: self._commentFeedID,
                            resetEditor: false,
                            totalItems: response.totalCount
                        });
                    }
                }
                self._clearNotifications();
            });
        },
        _clearNotifications: function() {
            if (this._notification && _.isFunction(this._notification.hide())) {
                this._notification.hide();
            }
            if ($('#elFlashMessage').find('[data-role="newPostNotification"]').length) {
                $('#elFlashMessage').find('[data-role="newPostNotification"]').trigger('closeFlashMsg.flashMsg');
            }
        },
        quickReply: function(e) {
            var form = this.scope.find('[data-role="replyArea"] form');
            if (form.attr('data-noAjax')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            var self = this;
            var replyArea = this.scope.find('[data-role="replyArea"]');
            var submit = form.find('[type="submit"]');
            var autoFollow = this.scope.find('input[name$="auto_follow_checkbox"]');
            var commentsOnThisPage = this.scope.find('[data-commentid]');
            var _lastSeenID = this._getLastSeenID(commentsOnThisPage);
            var initialText = submit.text();
            submit.prop('disabled', true).text(ips.getString('saving'));
            var page = ips.utils.url.getPageNumber(this._pageParam);
            if (!page) {
                page = 1;
            }
            this._clearNotifications();
            ips.getAjax()(form.attr('action'), {
                data: form.serialize() + '&currentPage=' + page + '&_lastSeenID=' + _lastSeenID,
                type: 'post'
            }).done(function(response) {
                if (response.type == 'error') {
                    if (response.form) {
                        ips.ui.editor.getObj(replyArea.find('[data-ipsEditor]')).destruct();
                        form.replaceWith($(response.form));
                        $(document).trigger('contentChange', [self.scope]);
                    } else {
                        ips.ui.alert.show({
                            type: 'alert',
                            icon: 'warn',
                            message: response.message,
                            callbacks: {}
                        });
                    }
                } else if (response.type == 'redirect') {
                    self.paginationClick(e, {
                        href: response.url,
                        originalEvent: e
                    });
                } else if (response.type == 'merge') {
                    var comment = self.scope.find('[data-commentid="' + response.id + '"]');
                    comment.find('[data-role="commentContent"]').html(response.content);
                    if (comment.find('pre.prettyprint').length) {
                        comment.find('pre.prettyprint').each(function() {
                            $(this).html(window.PR.prettyPrintOne(_.escape($(this).text())));
                        });
                    }
                    ips.ui.editor.getObj(self.scope.find('[data-role="replyArea"] [data-ipsEditor]')).reset();
                    if (self.scope.find('[data-role="replyArea"] input[name="guest_name"]').length) {
                        self.scope.find('[data-role="replyArea"] input[name="guest_name"]').val('');
                    }
                    form.find("[data-role='commentFormError']").each(function() {
                        $(this).remove();
                    });
                    var container = comment.closest('.ipsComment');
                    if (container.length) {
                        ips.utils.anim.go('pulseOnce', container);
                    } else {
                        ips.utils.anim.go('pulseOnce', comment);
                    }
                    ips.ui.flashMsg.show(ips.getString('mergedConncurrentPosts'));
                    $(document).trigger('contentChange', [self.scope]);
                } else {
                    if (response.postedByLoggedInMember) {
                        self.trigger('ipsDataLayer', {
                            _key: 'content_comment',
                            _properties: response.dataLayer
                        });
                    }
                    self.trigger('addToCommentFeed', {
                        content: response.content,
                        totalItems: response.total,
                        feedID: self._commentFeedID,
                        scrollToItem: true
                    });
                    if (response.message) {
                        ips.ui.flashMsg.show(response.message);
                    }
                    ips.ui.editor.getObj(self.scope.find('[data-role="replyArea"] [data-ipsEditor]')).reset();
                    if (self.scope.find('[data-role="replyArea"] input[name="guest_name"]').length) {
                        self.scope.find('[data-role="replyArea"] input[name="guest_name"]').val('');
                        self.scope.find('[data-role="replyArea"] [data-ipsEditor]').find('.ipsComposeArea_dummy').hide().end().find('[data-role="mainEditorArea"]').show().end().closest('.ipsComposeArea').removeClass('ipsComposeArea_minimized').find('[data-ipsEditor-toolList]').show();
                    }
                    form.find("[data-role='commentFormError']").each(function() {
                        $(this).remove();
                    });
                    if (autoFollow.length) {
                        self.trigger('followingItem', {
                            feedID: self.scope.attr('data-feedID'),
                            following: autoFollow.is(':checked')
                        });
                    }
                }
                self._clearNotifications();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                if (Debug.isEnabled()) {
                    Debug.error("Posting new reply failed: " + textStatus);
                    Debug.log(jqXHR);
                    Debug.log(errorThrown);
                } else {
                    form.attr('data-noAjax', 'true');
                    form.attr('action', form.attr('action') + ((!form.attr('action').match(/\?/)) ? '?failedReply=1' : '&failedReply=1'));
                    form.submit();
                }
            }).always(function() {
                submit.prop('disabled', false).text(initialText ? initialText : ips.getString('submit_reply'));
            });
        },
        loadNewPosts: function(e) {
            e.preventDefault();
            this._importNewReplies();
        },
        addToCommentFeed: function(e, data) {
            if (!data.content || data.feedID != this._commentFeedID) {
                return;
            }
            var textarea = this.scope.find('[data-role="replyArea"] textarea');
            var content = $('<div/>').append(data.content);
            var comment = content.find('.ipsComment');
            var commentFeed = this.scope.find('[data-role="commentFeed"]');
            if (commentFeed.find('[data-role="moderationTools"]').length) {
                commentFeed = commentFeed.find('[data-role="moderationTools"]');
            }
            this.scope.find('[data-role="noComments"]').remove();
            commentFeed.append(comment.css({
                opacity: "0.001"
            }));
            var newItemTop = comment.offset().top;
            var windowScroll = $(window).scrollTop();
            var viewHeight = $(window).height();
            var _showComment = function() {
                comment.css({
                    opacity: "1"
                });
                ips.utils.anim.go('fadeInDown', comment.filter(':not(.ipsHide)'));
            };
            if (!_.isUndefined(data.scrollToItem) && data.scrollToItem && (newItemTop < windowScroll || newItemTop > (windowScroll + viewHeight))) {
                $('html, body').animate({
                    scrollTop: newItemTop + 'px'
                }, 'fast', function() {
                    setTimeout(_showComment, 100);
                });
            } else {
                _showComment();
            }
            if (_.isUndefined(data.resetEditor) || data.resetEditor !== false) {
                ips.ui.editor.getObj(this.scope.find('[data-role="replyArea"] [data-ipsEditor]')).reset();
            }
            if (ips.utils.db.isEnabled()) {
                var buttons = comment.find('[data-action="multiQuoteComment"]');
                buttons.hide().removeClass('ipsHide');
                ips.utils.anim.go('fadeIn', buttons);
            }
            this._updateCount(data.totalItems);
            $(document).trigger('contentChange', [this.scope]);
        },
        deletedComment: function(e, data) {
            data = $.parseJSON(data.response);
            var self = this;
            if (data.type == 'redirect') {
                window.location = data.url;
            } else {
                this._updateCount(data.total);
            }
        },
        _updateCount: function(newTotal) {
            if (this.scope.find('[data-role="comment_count"]')) {
                var langString = 'js_num_comments';
                if (this.scope.find('[data-role="comment_count"]').attr('data-commentCountString')) {
                    langString = this.scope.find('[data-role="comment_count"]').attr('data-commentCountString');
                }
                this.scope.find('[data-role="comment_count"]').text(ips.pluralize(ips.getString(langString), newTotal));
            }
        },
        doMultiQuote: function(e) {
            var mqData = this._getMultiQuoteData();
            var replyArea = this.scope.find('[data-role="replyArea"]');
            var output = [];
            var self = this;
            if (!_.size(mqData) || !replyArea.is(':visible')) {
                return;
            }
            _.each(mqData, function(value) {
                output.push(value);
            });
            ips.ui.editor.getObjWithInit(this.scope.find('[data-role="replyArea"] [data-ipsEditor]'), function(editor) {
                editor.insertQuotes(output);
            });
            this._removeAllMultiQuoted();
        },
        clearMultiQuote: function(e) {
            e.preventDefault();
            this._removeAllMultiQuoted();
        },
        _removeAllMultiQuoted: function() {
            var mqData = this._getMultiQuoteData();
            var self = this;
            ips.utils.db.set('mq', 'data', {});
            this._buildMultiQuote(0);
            if (!_.size(mqData)) {
                return;
            }
            _.each(mqData, function(value) {
                self.triggerOn('core.front.core.comment', 'setMultiQuoteDisabled.comment', {
                    contentapp: value.contentapp,
                    contenttype: value.contenttype,
                    contentcommentid: value.contentcommentid
                });
            });
        },
        addMultiQuote: function(e, data) {
            var mqData = this._getMultiQuoteData();
            var key = data.contentapp + '-' + data.contenttype + '-' + data.contentcommentid;
            if (_.size(mqData) == this._maximumMultiQuote) {
                ips.ui.alert.show({
                    type: 'alert',
                    icon: 'warn',
                    message: ips.pluralize(ips.getString('maxmultiquote'), this._maximumMultiQuote),
                    callbacks: {
                        ok: function() {
                            $("button[data-mqId='" + data.button + "']").removeClass('ipsButton_alternate').addClass('ipsButton_simple').removeAttr('data-mqActive').html(ips.templates.render('core.posts.multiQuoteOff'));
                        }
                    }
                });
                return false;
            }
            mqData[key] = data;
            ips.utils.db.set('mq', 'data', mqData);
            this._buildMultiQuote(_.size(mqData));
        },
        removeMultiQuote: function(e, data) {
            var mqData = this._getMultiQuoteData();
            var key = data.contentapp + '-' + data.contenttype + '-' + data.contentcommentid;
            if (!_.isUndefined(mqData[key])) {
                mqData = _.omit(mqData, key);
                ips.utils.db.set('mq', 'data', mqData);
                this._buildMultiQuote(_.size(mqData));
            }
        },
        _getMultiQuoteData: function() {
            var mqData = ips.utils.db.get('mq', 'data');
            if (_.isUndefined(mqData) || !_.isObject(mqData)) {
                return {};
            }
            return mqData;
        },
        _setUpMultiQuote: function() {
            if (!ips.utils.db.isEnabled()) {
                return;
            }
            var buttons = this.scope.find('[data-action="multiQuoteComment"]');
            var self = this;
            var mqData = this._getMultiQuoteData();
            buttons.show();
            if (_.size(mqData)) {
                this._buildMultiQuote(_.size(mqData));
                _.each(mqData, function(value) {
                    self.triggerOn('core.front.core.comment', 'setMultiQuoteEnabled.comment', {
                        contentapp: value.contentapp,
                        contenttype: value.contenttype,
                        contentcommentid: value.contentcommentid
                    });
                });
            }
        },
        _buildMultiQuote: function(count) {
            var quoterElem = $('#ipsMultiQuoter');
            if (!quoterElem.length && count) {
                ips.getContainer().append(ips.templates.render('core.posts.multiQuoter', {
                    count: ips.getString('multiquote_count', {
                        count: ips.pluralize(ips.getString('multiquote_count_plural'), [count])
                    }),
                    commentFeedId: this._containerID
                }));
                ips.utils.anim.go('zoomIn fast', $('#ipsMultiQuoter'));
            } else {
                if (quoterElem.attr('data-commentsContainer') !== this._containerID) {
                    quoterElem.attr('data-commentsContainer', this._containerID).find('[data-role^="multiQuote_"]').attr('data-role', 'multiQuote_' + this._containerID).end().find('[data-action^="clearQuoted_"]').attr('data-action', 'clearQuoted_' + this._containerID);
                }
                quoterElem.find('[data-role="quotingTotal"]').text(ips.pluralize(ips.getString('multiquote_count_plural'), [count]));
                if (count && quoterElem.is(':visible')) {
                    ips.utils.anim.go('pulseOnce fast', quoterElem);
                } else if (count && !quoterElem.is(':visible')) {
                    ips.utils.anim.go('zoomIn fast', quoterElem);
                } else {
                    ips.utils.anim.go('zoomOut fast', quoterElem);
                }
            }
        },
        _getLastSeenID: function(commentsOnThisPage) {
            var commentFeed = this.scope.find('[data-role="commentFeed"]');
            var maxComment = _.max(commentsOnThisPage, function(comment) {
                return parseInt($(comment).attr('data-commentid'));
            });
            var max = $(maxComment).attr('data-commentid');
            if (commentFeed.attr('data-topicAnswerID') && parseInt(commentFeed.attr('data-topicAnswerID')) > max) {
                max = parseInt(commentFeed.attr('data-topicAnswerID'));
            }
            Debug.log("Max comment ID is " + max);
            return max;
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.commentsWrapper', {
        initialize: function() {
            this.on(document, 'addToCommentFeed', this.addToCommentFeed);
            this.on('deletedComment.comment', this.deletedComment);
        },
        addToCommentFeed: function(e, data) {
            this._updateCount($(e.target).attr('data-commentsType'), data.totalItems);
        },
        deletedComment: function(e, data) {
            try {
                var newTotal = $.parseJSON(data.response).total;
            } catch (err) {
                var newTotal = 0;
            }
            this._updateCount($(e.target).closest('[data-commentsType]').attr('data-commentsType'), newTotal);
        },
        _updateCount: function(type, number) {
            var langString = 'js_num_' + type;
            var elem = $('#' + $(this.scope).attr('data-tabsId') + '_tab_' + type);
            elem.text(ips.pluralize(ips.getString(langString), number));
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.ignoredComments', {
        initialize: function() {
            this.on('menuItemSelected', '[data-action="ignoreOptions"]', this.commentIgnore);
        },
        commentIgnore: function(e, data) {
            switch (data.selectedItemID) {
            case 'showPost':
                data.originalEvent.preventDefault();
                this._showHiddenPost(e, data);
                break;
            case 'stopIgnoring':
                data.originalEvent.preventDefault();
                this._stopIgnoringFromComment(e, data);
                break;
            }
        },
        _showHiddenPost: function(e, data) {
            var ignoreRow = $(data.triggerElem).closest('.ipsComment_ignored');
            var commentID = ignoreRow.attr('data-ignoreCommentID');
            var comment = this.scope.find('#' + commentID);
            ignoreRow.remove();
            comment.removeClass('ipsHide');
        },
        _stopIgnoringFromComment: function(e, data) {
            var ignoreRow = $(data.triggerElem).closest('.ipsComment_ignored');
            var userID = ignoreRow.attr('data-ignoreUserID');
            var self = this;
            var posts = this.scope.find('[data-ignoreUserID="' + userID + '"]');
            posts.each(function() {
                self.scope.find('#' + $(this).attr('data-ignoreCommentID')).removeClass('ipsHide');
                $(this).remove();
            });
            var url = ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=ignore&do=ignoreType&type=topics&off=1';
            ips.getAjax()(url, {
                data: {
                    member_id: parseInt(userID)
                }
            }).done(function() {
                ips.ui.flashMsg.show(ips.getString('ignore_prefs_updated'));
            }).fail(function() {
                window.location = ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=ignore&do=ignoreType&off=1type=topics&member_id=' + userID;
            });
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.instantNotifications', {
        _pollTimeout: 60,
        _windowInactivePoll: 0,
        _pollMultiplier: 1,
        _messagesEnabled: null,
        _ajaxObj: null,
        _debugPolling: true,
        _browserNotifications: {},
        _paused: false,
        _interval: null,
        initialize: function() {
            this.on(document, ips.utils.events.getVisibilityEvent(), this.windowVisibilityChange);
            this.on(window, 'storage', this.storageChange);
            this.setup();
        },
        setup: function() {
            if (!ips.utils.db.isEnabled() || !_.isFunction(JSON.parse)) {
                Debug.warn("Sorry, your browser doesn't support localStorage or JSON so we can't load instant notifications for you.");
                return;
            }
            this._messagesEnabled = this.scope.find('[data-notificationType="inbox"]').length;
            this._setInterval(this._pollTimeout);
            this._doInitialCheck();
        },
        storageChange: function(e) {
            var event = e.originalEvent;
            if (event.key !== 'notifications.' + ips.getSetting('baseURL')) {
                return;
            }
            if (this._debugPolling) {
                Debug.log('Notifications: updating instantly from storage event');
            }
            try {
                var data = JSON.parse(event.newValue);
                var counts = this._getCurrentCounts();
                this._updateIcons({
                    messages: parseInt(data.messages),
                    notifications: parseInt(data.notifications)
                }, counts);
            } catch (err) {}
        },
        windowVisibilityChange: function() {
            var hiddenProp = ips.utils.events.getVisibilityProp();
            if (!_.isUndefined(hiddenProp) && !document[hiddenProp]) {
                this._updateBrowserTitle(0);
                this._pollMultiplier = 1;
                this._windowInactivePoll = 0;
                if (this._paused) {
                    document.title = document.title.replace("❚❚ ", '');
                    this._checkNotifications();
                    this._setInterval(this._pollTimeout);
                }
                if (this._debugPolling) {
                    Debug.log("Notifications: Resetting inactive poll.");
                }
            }
        },
        _setInterval: function(timeoutInSecs) {
            clearInterval(this._interval);
            this._interval = setInterval(_.bind(this._checkNotifications, this), timeoutInSecs * 1000);
        },
        _doInitialCheck: function() {
            var storage = ips.utils.db.get('notifications', ips.getSetting('baseURL'));
            var counts = this._getCurrentCounts();
            if (!storage || !_.isObject(storage)) {
                return;
            }
            if ((this._messagesEnabled && counts.messages > storage.messages) || counts.notifications > storage.notifications) {
                if (this._debugPolling) {
                    Debug.log("Notifications: bubbles reporting higher counts for notifications or messages.");
                }
                var dataToSend = {
                    notifications: storage.notifications
                };
                if (this._messagesEnabled) {
                    dataToSend = _.extend(dataToSend, {
                        messages: storage.messages
                    });
                }
                this._doAjaxRequest(dataToSend);
            }
        },
        _checkNotifications: function() {
            var storage = ips.utils.db.get('notifications', ips.getSetting('baseURL'));
            var timestamp = ips.utils.time.timestamp();
            var counts = this._getCurrentCounts();
            var currentTimeout = this._pollTimeout * this._pollMultiplier;
            if (document[ips.utils.events.getVisibilityProp()]) {
                if (this._windowInactivePoll >= 3 && this._pollMultiplier === 1) {
                    if (this._debugPolling) {
                        Debug.log("Notifications: Polled over 3 minutes, increasing multiplier to 2");
                    }
                    this._pollMultiplier = 2;
                    this._setInterval(this._pollTimeout * this._pollMultiplier);
                } else if (this._windowInactivePoll >= 7 && this._pollMultiplier === 2) {
                    if (this._debugPolling) {
                        Debug.log("Notifications: Polled over 10 minutes, increasing multiplier to 3");
                    }
                    this._pollMultiplier = 3;
                    this._setInterval(this._pollTimeout * this._pollMultiplier);
                } else if (this._windowInactivePoll >= 25 && this._pollMultiplier === 3) {
                    if (this._debugPolling) {
                        Debug.log("Notifications: Polled over 60 mins, stopping polling");
                    }
                    this._stopPolling();
                    return;
                }
                this._windowInactivePoll++;
            }
            if ((storage && _.isObject(storage)) && parseInt(storage.timestamp) > (timestamp - ((currentTimeout - 1) * 1000))) {
                this._updateIcons(storage, counts);
                if (this._debugPolling) {
                    Debug.log("Notifications: fetching from localStorage");
                }
            } else {
                var dataToSend = {
                    notifications: counts.notifications
                };
                if (this._messagesEnabled) {
                    dataToSend = _.extend(dataToSend, {
                        messages: counts.messages
                    });
                }
                this._doAjaxRequest(dataToSend);
            }
        },
        _doAjaxRequest: function(dataToSend) {
            var self = this;
            var url = ips.getSetting('baseURL') + '?app=core&module=system&controller=ajax&do=instantNotifications';
            if (this._debugPolling) {
                Debug.log("Notifications: sending ajax request");
            }
            this._updateTimestamp();
            this._ajaxObj = ips.getAjax()(url, {
                data: dataToSend
            }).done(_.bind(this._handleResponse, this)).fail(function() {
                self._stopPolling(true);
                Debug.error("Problem polling for new notifications; stopping.");
            });
        },
        _handleResponse: function(response) {
            try {
                if (response.error && response.error == 'auto_polling_disabled') {
                    this._stopPolling(true);
                    return;
                }
                var counts = this._getCurrentCounts();
                if (response.notifications.count > counts.notifications && this._debugPolling) {
                    Debug.log("Notifications: I'm the winner! I found there's " + response.notifications.count + " new notifications");
                }
                this._updateIcons({
                    messages: response.messages.count,
                    notifications: response.notifications.count
                }, counts);
                ips.utils.db.set('notifications', ips.getSetting('baseURL'), {
                    timestamp: ips.utils.time.timestamp(),
                    messages: response.messages.count,
                    notifications: response.notifications.count
                });
                var total = response.messages.data.length + response.notifications.data.length;
                if (response.notifications.data.length) {
                    this._showNotification(this._buildNotifyData(response.notifications.data, 'notification'), 'notification');
                }
                if (response.messages.data.length) {
                    this._showNotification(this._buildNotifyData(response.messages.data, 'message'), 'message');
                }
            } catch (err) {
                this._stopPolling(true);
                return;
            }
            if (total > 0) {
                if (document[ips.utils.events.getVisibilityProp()]) {
                    this._updateBrowserTitle(total);
                }
            }
        },
        _updateBrowserTitle: function(count) {
            var cleanTitle = document.title.replace(/^\(\d+\)/, '').trim();
            if (count) {
                document.title = "(" + count + ") " + cleanTitle;
            } else {
                document.title = cleanTitle;
            }
        },
        _buildNotifyData: function(items, type) {
            var self = this;
            var notifyData = {
                count: items.length
            };
            if (items.length === 1) {
                notifyData = _.extend(notifyData, {
                    title: ips.getString(type + 'GeneralSingle'),
                    icon: items[0].author_photo,
                    body: items[0].title,
                    url: items[0].url,
                    onClick: function() {
                        try {
                            window.focus();
                        } catch (err) {}
                        window.location = items[0].url;
                    }
                });
            } else {
                notifyData = _.extend(notifyData, {
                    title: ips.pluralize(ips.getString(type + 'GeneralMultiple'), [items.length]),
                    body: items[0].title,
                    icon: ips.getSetting(type + '_imgURL'),
                    onClick: function() {
                        try {
                            window.focus();
                        } catch (err) {}
                        self._getIcon((type == 'message') ? 'inbox' : 'notify').click();
                    }
                });
            }
            return notifyData;
        },
        _showNotification: function(notifyData, type) {
            if (!document[ips.utils.events.getVisibilityProp()]) {
                this._showFlashMessage(notifyData, type);
            }
        },
        _showFlashMessage: function(notifyData, type) {
            var html = '';
            var self = this;
            if (notifyData.count === 1) {
                notifyData = _.extend(notifyData, {
                    text: ips.getString(type + 'FlashSingle')
                });
                html = ips.templates.render('core.notification.flashSingle', notifyData);
            } else {
                notifyData = _.extend(notifyData, {
                    text: ips.pluralize(ips.getString(type + 'FlashMultiple'), [notifyData.count])
                });
                html = ips.templates.render('core.notification.flashMultiple', notifyData);
            }
            if ($('#elFlashMessage').is(':visible') && $('#elFlashMessage').find('[data-role="newNotification"]').length) {
                $('#elFlashMessage').find('[data-role="newNotification"]').replaceWith(html);
            } else {
                ips.ui.flashMsg.show(html, {
                    timeout: 8,
                    position: 'bottom',
                    extraClasses: 'cNotificationFlash ipsPadding:half',
                    dismissable: function() {
                        self._stopPolling();
                    },
                    escape: false
                });
            }
        },
        _updateTimestamp: function() {
            var storage = ips.utils.db.get('notifications', ips.getSetting('baseURL'));
            storage = _.extend(storage, {
                timestamp: ips.utils.time.timestamp()
            });
            ips.utils.db.set('notifications', ips.getSetting('baseURL'), storage);
        },
        _updateIcons: function(newData, oldData) {
            var reportBadge = this.scope.find('[data-notificationType="reports"]');
            var reportCount = reportBadge.length ? parseInt(reportBadge.text()) : 0;
            var notifyData = {
                total: parseInt(newData.notifications) + reportCount,
                notifications: parseInt(newData.notifications),
                reports: reportCount
            };
            if (parseInt(newData.notifications) !== oldData.notifications) {
                this._updateIcon('notify', newData.notifications);
                this.scope.trigger('clearUserbarCache', {
                    type: 'notify'
                });
            }
            if (this._messagesEnabled) {
                if (parseInt(newData.messages) !== oldData.messages) {
                    this._updateIcon('inbox', newData.messages);
                    this.scope.trigger('clearUserbarCache', {
                        type: 'inbox'
                    });
                }
                notifyData.total += parseInt(newData.messages);
                notifyData.messages = parseInt(newData.messages);
            }
            this.scope.trigger('notificationCountUpdate', notifyData);
        },
        _updateIcon: function(type, count) {
            var icon = this._getIcon(type);
            icon.attr('data-currentCount', count).text(count);
            if (parseInt(count)) {
                ips.utils.anim.go((!icon.is(':visible')) ? 'zoomIn' : 'pulseOnce', icon.removeClass('ipsHide'));
            } else {
                icon.fadeOut();
            }
        },
        _getIcon: function(type) {
            return $('body').find('[data-notificationType="' + type + '"]');
        },
        _getCurrentCounts: function() {
            var messages = this.scope.find('[data-notificationType="inbox"]');
            var notifications = this.scope.find('[data-notificationType="notify"]');
            return {
                notifications: parseInt(notifications.attr('data-currentCount')),
                messages: (messages.length) ? parseInt(messages.attr('data-currentCount')) : null
            };
        },
        _stopPolling: function(fatal) {
            Debug.info("Stopping instant notification polling");
            clearInterval(this._interval);
            this._paused = true;
            document.title = "❚❚ " + document.title.replace("❚❚ ", "");
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.register('core.front.core.lightboxedImages', {
        _random: null,
        initialize: function() {
            var self = this;
            this.on('initializeImages', this.refreshContent);
            this.on('refreshContent', this.refreshContent);
            this.on(document, 'imageRotated', function(e, data) {
                var attachment = $(self.scope).find('.ipsAttachLink_image img[data-fileId=' + data.fileId + ']');
                self._updateAttachmentImage(attachment, data);
            });
            this.setup();
        },
        setup: function() {
            this._random = 'g' + (Math.round(Math.random() * 100000));
            this._initializeAttachments();
            this._initializeImages();
        },
        refreshContent: function(e) {
            Debug.log("Refreshing content in lightboxedImages");
            this.scope.removeAttr('data-loaded');
            this._initializeAttachments();
            this._initializeImages();
            e.stopPropagation();
        },
        _initializeAttachments: function() {
            var fileIDsToFetch = {};
            var self = this;
            var attachments = this.scope.find('[data-fileid]').not(function(idx, elem) {
                var elem = $(elem);
                return elem.is('source, video') || elem.find('source, video').length;
            });
            if (!attachments.length) {
                return;
            }
            attachments.each(function() {
                var attachment = $(this);
                if (!_.isUndefined(attachment.attr('data-loaded'))) {
                    return;
                }
                if (!(attachment.is('img, .ipsAttachLink_image'))) {
                    var parent = attachment.parent();
                    var clone = parent.clone();
                    clone.children().remove();
                    clone.text(clone.text().replace(/\s/g, ''));
                    if (!clone.text().length && attachment.parentsUntil(this.scope, 'li').length === 0) {
                        attachment.addClass('ipsAttachLink_block');
                        if (attachment.children().length) {
                            return;
                        }
                        var title = attachment.text();
                        attachment.html(ips.templates.render('core.attachments.attachmentPreview', {
                            title: title
                        }));
                    } else {
                        attachment.addClass('ipsAttachLink_inline');
                        attachment.attr('title', ips.getString('attachmentPending'));
                        attachment.attr('data-ipstooltip', true);
                    }
                }
                fileIDsToFetch[attachment.attr('data-fileid')] = true;
            });
            if (!_.size(fileIDsToFetch)) {
                return;
            }
            ips.utils.lazyLoad.observe(this.scope.get(0), {
                loadCallback: function() {
                    ips.getAjax()(ips.getSetting('baseURL') + 'index.php?app=core&module=system&controller=ajax&do=attachmentInfo', {
                        dataType: 'json',
                        data: {
                            attachIDs: fileIDsToFetch
                        }
                    }).done(function(response) {
                        attachments.each(function() {
                            var attachment = $(this);
                            var attachmentID = attachment.attr('data-fileid');
                            if (_.isUndefined(response[attachmentID])) {
                                self._updateAttachmentMetaDataError(attachment);
                            } else if (!_.isUndefined(response[attachmentID].rotate)) {
                                self._updateAttachmentImage(attachment, response[attachmentID]);
                            } else {
                                self._updateAttachmentMetaData(attachment, response[attachmentID]);
                            }
                        });
                    }).fail(function() {
                        attachments.each(function() {
                            var attachment = $(this);
                            self._updateAttachmentMetaDataError(attachment);
                        });
                    });
                }
            });
        },
        _updateAttachmentMetaData: function(attachment, response) {
            var attachmentID = attachment.attr('data-fileid');
            if (attachment.hasClass('ipsAttachLink_block')) {
                attachment.find('.ipsAttachLink_metaInfo').html(ips.templates.render('core.attachments.metaInfo', {
                    size: response.size,
                    downloads: ips.pluralize(ips.getString('attachmentDownloads'), response.downloads)
                }));
            } else {
                attachment.attr('title', response.size + ' - ' + ips.pluralize(ips.getString('attachmentDownloads'), response.downloads));
            }
            attachment.attr('data-loaded', true);
        },
        _updateAttachmentImage: function(attachment, response) {
            return;
            if (!(attachment.is('img'))) {
                return;
            }
            if (!_.isUndefined(response.rotate) && response.rotate !== null) {
                attachment.attr('data-rotate', response.rotate).css('transform', '');
                attachment.parents('a.ipsAttachLink_image').css({
                    'transform': 'rotate(' + response.rotate + 'deg)',
                    'position': 'absolute',
                    'top': 0
                });
                if (response.rotate == 90 || response.rotate == -270) {
                    if (attachment.width() > attachment.height()) {
                        attachment.parents('a.ipsAttachLink_image').css({
                            'right': '40%',
                            'height': '100%'
                        });
                    } else {
                        attachment.parents('a.ipsAttachLink_image').css({
                            'left': '5%',
                            'transform-origin': 'right'
                        });
                    }
                } else if (response.rotate == -90 || response.rotate == 270) {
                    if (attachment.width() > attachment.height()) {
                        attachment.parents('a.ipsAttachLink_image').css({
                            'right': '40%',
                            'height': '100%'
                        });
                    } else {
                        attachment.parents('a.ipsAttachLink_image').css({
                            'left': '40%',
                            'transform-origin': 'left'
                        });
                    }
                }
                var containerHeight = attachment.height();
                if (response.rotate != 0 && response.rotate != 180 && response.rotate != -180) {
                    containerHeight = attachment.width();
                }
                var parent = attachment.parents('p:first');
                if ($(parent).height() < containerHeight) {
                    $(parent).css({
                        'height': parseInt(containerHeight + 5).toString() + 'px',
                        'position': 'relative'
                    });
                }
            }
        },
        _updateAttachmentMetaDataError: function(attachment) {
            if (attachment.hasClass('ipsAttachLink_block')) {
                attachment.find('.ipsAttachLink_metaInfo').html(ips.getString('attachmentUnavailable'));
            } else {
                attachment.attr('title', ips.getString('attachmentUnavailable'));
            }
            attachment.attr('data-loaded', true);
        },
        _preLazyLoadInit: function(elem) {
            ips.utils.lazyLoad.preload(elem);
            this._nonLazyLoadInit(elem);
        },
        _nonLazyLoadInit: function(image) {
            if (image instanceof $) {
                var rawImage = image.get(0);
            } else {
                var rawImage = image;
                image = $(image);
            }
            if ((!image.is('img') || image.is('[data-emoticon], .ipsEmoji')) && !image.hasClass('ipsImage_thumbnailed')) {
                return;
            }
            image.addClass('ipsImage_thumbnailed');
            this._addOrUpdateWrappingLink(image);
        },
        _addOrUpdateWrappingLink: function(image) {
            var closestLink = image.closest('a');
            var imageSrc = image.attr('data-src') ? image.attr('data-src') : image.attr('src');
            var fileId = image.attr('data-fileid');
            if (closestLink.length && closestLink.hasClass('ipsAttachLink') && closestLink.hasClass('ipsAttachLink_image')) {
                var href = closestLink.attr('href');
                var ext = href.substr(href.lastIndexOf('.') + 1).toLowerCase();
                if (['gif', 'jpeg', 'jpe', 'jpg', 'png'].indexOf(ext) !== -1) {
                    closestLink.attr('data-fileId', fileId).attr('data-fullURL', closestLink.attr('href')).attr('data-ipsLightbox', '').attr('data-ipsLightbox-group', this._random);
                }
            } else if (!closestLink.length) {
                let link = $('<a data-wrappedLink data-ipslightbox>').attr('href', imageSrc).attr('title', ips.getString('enlargeImage')).attr('data-fileid', fileId).attr('data-lightbox-group', this._random);
                image.wrap(link);
            }
        },
        _initializeImages: function() {
            var self = this;
            var toLazyLoad = this.scope.find(ips.utils.lazyLoad.contentSelector);
            if (toLazyLoad.length) {
                if (ips.getSetting('lazyLoadEnabled')) {
                    var _preloadBound = _.bind(this._preLazyLoadInit, this);
                    toLazyLoad.each(function() {
                        ips.utils.lazyLoad.observe(this, {
                            preloadCallback: _preloadBound,
                        });
                    });
                } else {
                    var _nonLazyLoadBound = _.bind(this._nonLazyLoadInit, this);
                    ips.utils.lazyLoad.loadContent(this.scope.get(0), _nonLazyLoadBound);
                }
            }
            var nonLazyImages = this.scope.find('img:not([data-src])');
            if (nonLazyImages.length) {
                this.scope.imagesLoaded(function(imagesLoaded) {
                    if (!imagesLoaded.images.length) {
                        return;
                    }
                    _.each(imagesLoaded.images, function(image, i) {
                        self._nonLazyLoadInit(image.img);
                    });
                });
            }
        }
    });
}(jQuery, _));
;;(function($, _, undefined) {
    "use strict";
    ips.controller.mixin('contentListing', 'core.global.core.table', true, function() {
        this._rowSelector = 'li';
        this.after('initialize', function() {
            this.on('menuItemSelected', '[data-role="sortButton"]', this.changeSorting);
            this.on('change', '[data-role="moderation"]', this.selectRow);
            this.on('click', '[data-action="markAsRead"]', this.markAsRead);
            this.on('paginationClicked', this.frontPaginationClicked);
            this.on('markTableRead', this.markAllRead);
            $(document).on('markTableRowRead', _.bind(this.markRowRead, this));
            $(document).on('markAllRead', _.bind(this.markAllRead, this));
            $(document).on('updateTableURL', _.bind(this.updateTableURL, this));
            $(document).on('moderationSubmitted', _.bind(this.clearLocalStorage, this));
        });
        this.after('setup', function() {
            this._tableID = this.scope.attr('data-tableID');
            this._storeID = 'table-' + this._tableID;
            if (this.scope.attr('data-dummyLoadingSelector')) {
                this._rowSelector = this.scope.attr('data-dummyLoadingSelector');
            }
            this._findCheckedRows();
        });
        this.before('_handleStateChanges', function(state) {
            ips.utils.analytics.trackPageView(state.url);
        });
        this.before('_getResults', function() {
            this._setTableLoading(true);
        });
        this.after('_getResultsAlways', function() {
            this._setTableLoading(false);
        });
        this.after('_updateTable', function() {
            this.scope.find('[data-ipsPageAction]').trigger('refresh.pageAction');
            this.scope.find('[data-role="tableRows"]').css({
                opacity: "0.0001"
            }).animate({
                opacity: "1"
            });
            this._findCheckedRows();
        });
        this._findCheckedRows = function() {
            if (!this.scope.find('input[type="checkbox"]').length) {
                return;
            }
            var dataStore = ips.utils.db.get('moderation', this._storeID) || {};
            var self = this;
            var pageAction = this.scope.find('[data-ipsPageAction]');
            if (_.size(dataStore)) {
                var sizeOtherPage = 0;
                _.each(dataStore, function(val, key) {
                    if (self.scope.find('[data-rowid="' + key + '"]').length) {
                        self.scope.find('[data-rowid="' + key + '"]').addClass('ipsDataItem_selected').find('input[type="checkbox"][data-role="moderation"]').attr('checked', true).trigger('change');
                    } else {
                        sizeOtherPage++;
                        pageAction.trigger('addManualItem.pageAction', {
                            id: 'moderate[' + key + ']',
                            actions: val
                        });
                    }
                });
                if (this.scope.find('[data-ipsAutoCheck]')) {
                    this.scope.find('[data-ipsAutoCheck]').trigger('setInitialCount.autoCheck', {
                        count: sizeOtherPage
                    });
                }
            }
        }
        ;
        this.clearLocalStorage = function() {
            ips.utils.db.remove('moderation', this._storeID);
        }
        ;
        this._showLoading = function() {
            return _.isUndefined(this.scope.attr('data-dummyLoading'));
        }
        ;
        this.markAllRead = function() {
            this.scope.find('.ipsDataItem, .ipsDataItem_subList .ipsDataItem_unread').removeClass('ipsDataItem_unread').find('.ipsItemStatus').addClass('ipsItemStatus_read');
        }
        ;
        this.markRowRead = function(e, data) {
            if (_.isUndefined(data.tableID) || data.tableID != this._tableID) {
                return;
            }
            this.scope.find('[data-rowID="' + data.rowID + '"]').removeClass('ipsDataItem_unread').find('.ipsItemStatus').addClass('ipsItemStatus_read');
        }
        ;
        this.updateTableURL = function(e, data) {
            this.updateURL(data);
        }
        ;
        this.frontPaginationClicked = function() {
            var wrappingDialog = this.scope.closest('.ipsDialog');
            var elemPosition = ips.utils.position.getElemPosition(wrappingDialog.length ? wrappingDialog : this.scope);
            $('html, body').animate({
                scrollTop: elemPosition.absPos.top + 'px'
            });
        }
        ;
        this.selectRow = function(e) {
            var row = $(e.currentTarget).closest('.ipsDataItem');
            var rowID = row.attr('data-rowID');
            var dataStore = ips.utils.db.get('moderation', this._storeID) || {};
            var rowActions = row.find('[data-role="moderation"]').attr('data-actions');
            row.toggleClass('ipsDataItem_selected', $(e.currentTarget).is(':checked'));
            if ($(e.currentTarget).is(':checked')) {
                if (_.isUndefined(dataStore[rowID])) {
                    dataStore[rowID] = rowActions;
                }
            } else {
                delete dataStore[rowID];
            }
            if (_.size(dataStore)) {
                ips.utils.db.set('moderation', this._storeID, dataStore);
            } else {
                ips.utils.db.remove('moderation', this._storeID);
            }
        }
        ;
        this.markAsRead = function(e) {
            e.preventDefault();
            var self = this;
            var item = $(e.currentTarget);
            var url = item.attr('href');
            var execMark = function() {
                var row = item.closest('.ipsDataItem');
                row.removeClass('ipsDataItem_unread').find('.ipsItemStatus').addClass('ipsItemStatus_read');
                row.find('.ipsDataItem_subList .ipsDataItem_unread').removeClass('ipsDataItem_unread');
                ips.utils.anim.go('fadeOut', $('#ipsTooltip'));
                item.removeAttr('data-ipstooltip').removeAttr('title');
                ips.getAjax()(url, {
                    bypassRedirect: true
                }).done(function(response) {
                    item.trigger('markedAsRead');
                }).fail(function() {
                    item.closest('.ipsDataItem').addClass('ipsDataItem_unread').find('.ipsItemStatus').removeClass('ipsItemStatus_read');
                    ips.ui.alert.show({
                        type: 'alert',
                        icon: 'error',
                        message: ips.getString('errorMarkingRead'),
                        callbacks: {
                            ok: function() {}
                        }
                    });
                });
            };
            if (ips.utils.events.isTouchDevice()) {
                ips.ui.alert.show({
                    type: 'confirm',
                    icon: 'question',
                    message: ips.getString('notificationMarkAsRead'),
                    callbacks: {
                        ok: function() {
                            execMark();
                        }
                    }
                });
            } else {
                execMark();
            }
        }
        ;
        this._setTableLoading = function(loading) {
            var rowElem = this.scope.find('[data-role="tableRows"]');
            var rows = rowElem.find('> ' + this._rowSelector);
            if (_.isUndefined(this.scope.attr('data-dummyLoading'))) {
                this._basicLoading(loading);
                return;
            }
            if (!loading || !rowElem.length || !rows.length) {
                return;
            }
            var template = 'table.row.loading';
            if (this.scope.attr('data-dummyLoadingTemplate')) {
                template = this.scope.attr('data-dummyLoadingTemplate');
            }
            var newRows = [];
            for (var i = 0; i <= rows.length; i++) {
                var rnd = parseInt(Math.random() * (10 - 1) + 1);
                newRows.push(ips.templates.render(template, {
                    extraClass: this.scope.attr('data-dummyLoadingClass') || '',
                    rnd: rnd
                }));
            }
            this.scope.find('[data-role="tableRows"]').html(newRows.join(''));
        }
        ;
        this._basicLoading = function(loading) {
            var rowElem = this.scope.find('[data-role="tableRows"]');
            if (!rowElem.length) {
                return;
            }
            if (!this._tableOverlay) {
                this._tableOverlay = $('<div/>').addClass('ipsLoading').hide();
                ips.getContainer().append(this._tableOverlay);
            }
            if (loading) {
                var dims = ips.utils.position.getElemDims(rowElem);
                var position = ips.utils.position.getElemPosition(rowElem);
                this._tableOverlay.show().css({
                    left: position.viewportOffset.left + 'px',
                    top: position.viewportOffset.top + $(document).scrollTop() + 'px',
                    width: dims.width + 'px',
                    height: dims.height + 'px',
                    position: 'absolute',
                    zIndex: ips.ui.zIndex()
                });
                rowElem.css({
                    opacity: "0.5"
                });
            } else {
                rowElem.animate({
                    opacity: "1"
                });
                this._tableOverlay.hide();
            }
        }
        ;
        this.changeSorting = function(e, data) {
            data.originalEvent.preventDefault();
            if (_.isUndefined(data.selectedItemID)) {
                return;
            }
            var current = this._getSortValue();
            var menuItem = data.menuElem.find('[data-ipsMenuValue="' + data.selectedItemID + '"]');
            var sortBy = data.selectedItemID;
            var sortDirection = current.order;
            if (menuItem.attr('data-sortDirection')) {
                sortDirection = menuItem.attr('data-sortDirection');
            }
            this.updateURL({
                sortby: sortBy,
                sortdirection: sortDirection,
                page: 1
            });
        }
        ;
        this._getSortValue = function() {
            var by = ips.utils.url.getParam('sortby');
            var order = ips.utils.url.getParam('sortdirection');
            return {
                by: by || '',
                order: order || ''
            };
        }
        ;
        this._getFilterValue = function() {
            var filter = ips.utils.url.getParam('filter');
            return filter || '';
        }
        ;
    });
}(jQuery, _));
;