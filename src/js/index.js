'use strict';
class AccessibleDatepicker{

    constructor(){
        this.now = moment().startOf("day");
        this.maxDate = moment().add(1, "year");
        this.existing = false;
        this._id = Math.random().toString().substring(2,7);
        this.options = {
            monthTitleFormat: "MMMM YYYY",
                initDate: null,
                allowPastDates: false,
                title: ""
        };
        this.animating= false;
        this.currentDate= null;
        this.months= null;
        this.leftArrow= '\x3csvg xmlns\x3d"http://www.w3.org/2000/svg" viewBox\x3d"0 0 11 11"\x3e\x3cpath d\x3d"M5.36,0.51h0A0.84,0.84,0,0,1,6,.76,0.86,0.86,0,0,1,6,2L3.3,4.66H9.65a0.85,0.85,0,0,1,0,1.7H3.45L6.1,9.06a0.85,0.85,0,0,1-1.2,1.2L0.75,6a0.85,0.85,0,0,1,0-1.2l4-4.07A0.84,0.84,0,0,1,5.36.51Z"/\x3e\x3c/svg\x3e\n';
        this.rightArrow='\x3csvg xmlns\x3d"http://www.w3.org/2000/svg" viewBox\x3d"0 0 11 11"\x3e\x3cpath d\x3d"M5.64,10.5h0A0.84,0.84,0,0,1,5,10.25,0.86,0.86,0,0,1,5,9L7.7,6.35H1.35a0.85,0.85,0,0,1,0-1.7H7.55L4.9,2a0.86,0.86,0,0,1,0-1.2,0.86,0.86,0,0,1,1.2,0L10.25,5a0.85,0.85,0,0,1,0,1.2l-4,4.07A0.84,0.84,0,0,1,5.64,10.5Z"/\x3e\x3c/svg\x3e\n';
        if(!String.prototype.format){
            String.prototype.format = function() {
                return [].slice.call(arguments).reduce(function(a, b) {
                    return a.replace("%s", b)
                }, this.valueOf())
            };
        }
        this.currentDate = this.getInitDate();
        this.create(this.currentDate);
        this.bindElements();
        this.addEventHandlers();
    }
    id(elem){
        return this._id+'-'+elem;
    }
    bindElements() {
        this.months = this.getChildElement("months");
        this.animation = this.getChildElement("animation");
        this.displayWrapper = this.getChildElement("displayWrapper");
        this.next = this.getChildElement("next");
        this.prev = this.getChildElement("prev")
    }
    addEventHandlers() {
        this.next.addEventListener('click',this.onNextClick.bind(this));
        this.prev.addEventListener('click',this.onPrevClick.bind(this));
        //this.prev.keypress(this.proxyClick.bind(this));
        //this.next.keypress(this.proxyClick.bind(this));
        //this.addDayEventHandlers(this.months.childNodes);
    }
    onNextClick(event) {
        if(!event.currentTarget.classList.contains('disabled')){
            if(this.animating){
                event.preventDefault();
            }else{
                this.changeMonth(1);
            }
        }
    }
    onPrevClick(event) {
        if(!event.currentTarget.classList.contains('disabled')){
            if(this.animating){
                event.preventDefault();
            }else{
                this.changeMonth(-1);
            }
        }
    }
    proxyClick(event) {
        32 != event.which && 13 != event.which || this.trigger("click");
    }
    addDayEventHandlers(a) {
        a = a.getElementsByClassName(".col-day")[0];
        if(a && a.hasAttribute('data-val') && !a.classList.contains('disabled')){
            a.addEventListener("click.day", this.onDayClick);
            a.addEventListener("mouseenter.day", this.onDayPreviewOver);
            a.addEventListener("mouseleave.day", this.onDayPreviewOut);
        }
    }
    onMonthChange() {
        //this.updateBuzzData();
        //this.markSelectedDays()
    }
    markSelectedDays() {
        var a;
        this.clearDayState("highlighted");
        this.clearDayState("preview");
        this.clearDayState("selected");
        switch (this.dateMode) {
            case this.DateMode.RANGE:
                a = this.computeActiveDates("[data-val\x3d%s]");
                1 < a.length && this.getSelectableDays(a.join(",")).addClass("highlighted");
                this.startDate && (a = this.getStartDayElements(),
                a.flex && a.flex.addClass("flex"),
                a.exact && a.exact.addClass("selected").attr("aria-selected", "true"));
                this.endDate && (a = this.getEndDayElements(),
                a.flex && a.flex.addClass("flex"),
                a.exact && a.exact.addClass("selected").attr("aria-selected", "true"));
                break;
            case this.DateMode.OPENFLEX:
                a = this.computeActiveDates("[data-val\x3d%s]");
                this.getSelectableDays(a.join(",")).addClass("selected").attr("aria-selected", "true");
                this.getDayElement(this.startDate).addClass("selected").attr("aria-selected", "true");
                break;
            case this.DateMode.WEEKEND:
                a = this.computeActiveDates("[data-val\x3d%s]");
                this.getSelectableDays(a.selected.join(",")).addClass("selected").attr("aria-selected", "true");
                a.highlighted.length && this.getSelectableDays(a.highlighted.join(",")).addClass("highlighted");
                break;
            default:
                this.getDayElement(this.startDate).addClass("selected").attr("aria-selected", "true")
        }
    }
    updateBuzzData() {
        this.isBuzzEnabled() && (new k.DatePicker.BuzzData).fetch(this.options.getFormData(), this.handleBuzzUpdate.bind(this))
    }
    changeMonth(a) {
        var b = this;
        this.currentDate.add(a, "month");
        if(1 !== Math.abs(a) || 500 > this.animation.clientWidth){
            this.update(this.currentDate);
            this.onMonthChange();
        }else{
            this.animating = false;
            this.animation.classList.add("animating");
            this.animation.style.transform= "translateX(%spx)".format(-260 * a);
            //this.setDisplayHeight(a);
                setTimeout(function() {
                    b.animating = !1;
                    b.animation.classList.remove("animating");
                    b.animation.style.transform = "translateX(0px)";
                    if(-1 == a){
                        b.removeMonth(b.months.childNodes[b.months.childNodes.length-1]);
                            b.addMonth(b.makeMonthHTML(b.currentDate.clone(), -1), !0);
                            b.months.childNodes[1].setAttribute("aria-hidden", "false");
                        b.months.childNodes[1].classList.remove("col-hidden");
                            b.months.childNodes[3].setAttribute("aria-hidden", "true");
                        b.months.childNodes[3].classList.add("col-hidden");
                    }else{
                        1 == a ;
                        b.removeMonth(b.months.childNodes[0]);
                            b.addMonth(b.makeMonthHTML(b.currentDate.clone(), 2), !1);
                            b.months.append();
                            b.months.childNodes[2].setAttribute("aria-hidden", "false");
                        b.months.childNodes[2].classList.remove("col-hidden");
                            b.months.childNodes[0].setAttribute("aria-hidden", "true");
                        b.months.childNodes[0].classList.add("col-hidden");
                    }
                    b.onMonthChange();
                }, 200);
                this.updateNav();
        }
    }
    removeMonth(a) {
        this.removeDayEventHandlers(a);
        a.remove()
    }
    removeDayEventHandlers(a) {
        a = a.getElementsByClassName(".col-day")[0];
        if(a && a.hasAttribute('data-val') && !a.classList.contains('disabled')){
            a.removeEventListener("click.day", this.onDayClick);
            a.removeEventListener("mouseenter.day", this.onDayPreviewOver);
            //a.removeEventListener("focus.day");
            a.removeEventListener("mouseleave.day", this.onDayPreviewOut);
            //a.removeEventListener("blur.day");
        }
    }
    addMonth(a, b) {
        if(b){
            let tempElem = document.createElement('div');
            tempElem.setAttribute('id', 'tempElem');
            tempElem.style.display = "none";
            tempElem.innerHTML = a;
            this.months.prepend(tempElem.childNodes[0]);
            this.addDayEventHandlers(this.months.childNodes[0]);
        }else{
            let tempElem = document.createElement('div');
            tempElem.setAttribute('id', 'tempElem');
            tempElem.style.display = "none";
            tempElem.innerHTML = a;
            this.months.appendChild(tempElem.childNodes[0]);
            this.addDayEventHandlers(this.months.childNodes[this.months.childNodes.length -1]);
        }

    }
    updateNav() {
        if(this.checkDate(this.getMonthDate(-1, !0))){
            this.prev.classList.remove("disabled");
            this.prev.removeAttribute("disabled");
        }else{
            this.prev.classList.add("disabled");
            this.prev.setAttribute("disabled", "disabled");
        }
        if(this.checkDate(this.getMonthDate(2))){
            this.next.classList.remove("disabled");
            this.next.removeAttribute("disabled")
        }else{
            this.next.classList.add("disabled");
        this.next.setAttribute("disabled", "disabled");
        }
    }
    onDayClick(a, b) {
        a = g(a).data("val");
        this.changeDate(a)
    }
    changeDate(a, b) {
        moment(a);
        var d = !1
            , c = !0
            , e = {
                action: "change",
                fields: {}
            };
        if (this.dateMode === this.DateMode.RANGE)
            "startDate" === this.picking && this.validateDate(a) ? (this.startDate === a ? (c = !1,
                this.setPicking("endDate")) : (this.startDate = a,
                e.fields.startDate = a,
            this.validateDateRange(a, this.endDate) || (this.endDate = 0,
                e.fields.endDate = this.getMinEndDate()),
                this.moveDateIntoView(a),
                this.markSelectedDays(),
            b || this.setPicking("endDate")),
            "endDate" === this.wasPicking && this.endDate && (e.fields.endDate = this.endDate)) : "endDate" === this.picking && this.validateDate(a) && (this.endDate === a ? (c = !1,
            0 === this.startDate ? this.setPicking("startDate") : d = !0) : (this.validateDateRange(this.startDate, a) ? (this.endDate = a,
            e.fields.endDate = a) : this.startDate || (this.endDate = a,
            e.fields.endDate = this.endDate),
            this.moveDateIntoView(this.endDate),
            this.markSelectedDays(),
        b || (0 === this.startDate ? this.setPicking("startDate") : d = !0))),e.picking = this.picking;
    else {
            this.moveDateIntoView(a);
            e.fields.startDate = a;
            if (this.validateDate(this.endDate) && !this.validateDateRange(a, this.endDate)) {
                var f = Math.max(this.options.minRange, 1)
                    , f = moment(a).add(f, "days");
                e.fields.endDate = f.valueOf();
                this.endDate = e.fields.endDate
            }
            this.startDate = a;
            this.markSelectedDays();
            b || (d = !0)
        }
        c && (this.publishUpdate(e),
        "function" === typeof this.options.change && (a = [this.startDate],
        this.endDate && a.push(this.endDate),
            this.options.change.apply(this, a)));
        if (d)
            this.onDismiss()
    }
    onDayPreviewOver(a, b) {
        a = g(a).data("val");
        this.previewDate(a)
    }
    previewDate(a, b) {
        var d = moment(a)
            , c = {
                action: "preview",
                fields: {},
                picking: this.picking
            };
        !a || d.isBefore(this.now) ? (d = this.now.clone(),
                                      a = d.valueOf()) : d.isSameOrAfter(this.maxDate) && (d = this.maxDate.clone(),
            a = d.valueOf());
        this.dateMode === this.DateMode.RANGE && ("endDate" === this.picking && 0 !== this.startDate ? this.validateMinRange(this.startDate, a) ? this.validateDateRange(this.startDate, a) ? c.fields[this.picking] = a : c.endDate = this.getMinEndDate() : (0 === this.endDate ? (this.endDate = this.startDate,
            this.startDate = 0,
            c.fields = {
                startDate: a,
                endDate: this.endDate
            }) : c.fields = {
            startDate: a,
            endDate: 0
        },
            this.wasPicking = this.picking,
            this.setPicking("startDate", !1, !0),
            c.picking = "startDate") : c.fields[this.picking] = a);
        b || this.publishUpdate(c);
        this.moveDateIntoView(a);
        this.markPreviewedDays(a)
    }
    removeDatePreview(a, b) {
        if (this.visible) {
            a = {
                action: "preview",
                fields: {
                    startDate: 0,
                    endDate: 0
                },
                clear: !0
            };
            this.clearDayState("preview");
            this.clearDayState("hover");
            this.hideTooltip();
            if (this.wasPicking) {
                var d = this[this.wasPicking]
                    , c = this[this.picking];
                if (0 === c || 0 === d)
                    this[this.wasPicking] = c,
                        this[this.picking] = d;
                delete a.fields[this.wasPicking];
                this.setPicking(this.wasPicking, !1, !0);
                this.wasPicking = null;
                this.markSelectedDays()
            }
            a.picking = this.picking;
            b || this.publishUpdate(a)
        }
    }
    onDayPreviewOut(a, b) {
        a = g(a).data("val");
        this.removeDatePreview(a)
    }
    getChildElement(elem){
        return document.getElementById(this.id(elem));
    }
    checkDate(currDate) {
        return currDate.isBefore(this.now) && !this.options.allowPastDates || currDate.isAfter(this.maxDate) || null !== this.minDate && currDate.isBefore(this.minDate) ? false : true;
    }
    getMonthDate(a, b) {
        a = this.currentDate.clone().add(a, "month");
        return b ? a.endOf("month") : a.startOf("month")
    }
    create(currentDate) {
        let calHTML = this.makeHTML(currentDate);
        let wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'com-cal');
        wrapper.innerHTML = calHTML;
        document.getElementsByTagName('body')[0].appendChild(wrapper);
        //this.element = f("#%s".format(this.id()));
        //this.elementNode = this.element.get(0)
    }
    getInitDate() {
        var currDate = this.options.initDate, currDate = currDate ? moment(currDate) : this.now.clone();
        if(currDate.isBefore(this.now) && !this.options.allowPastDates){
            currDate = this.now.clone();
        }
        return currDate;
    }
    makeHTML(currentDate) {
        var b = [];
        if (!this.existing) {
            b.push("\x3cdiv id\x3d'%s' class\x3d'%s'\x3e".format(this.id(),
                this.getCssClass()));
            b.push("\x3cdiv id\x3d'%s' class\x3d'pointer'\x3e\x3c/div\x3e".format(this.id("pointer")));
            b.push("\x3cdiv id\x3d'%s' class\x3d'title %s'\x3e%s\x3c/div\x3e".format(this.id("title"), this.options.title ? "" : "hidden", this.options.title ? this.options.title : ""));
            var c = this.makeAboveCalendarHTML();
            b.push("\x3cdiv id\x3d'%s' class\x3d'aboveCalendar %s'\x3e".format(this.id("above"), c.length ? "" : "hidden"));
            b.push(c);
            b.push("\x3c/div\x3e");
            b.push("\x3cdiv id\x3d'%s' class\x3d'displayWrapper'\x3e".format(this.id("displayWrapper")));
            b.push(this.makeNavHTML(currentDate));
            b.push("\x3cdiv class\x3d'keel-grid weekDaysGrid'\x3e");
            c = this.makeWeekHeaderHTML(false);
            b.push("\x3cdiv class\x3d'col-hidden col-weekHeader col-weekHeader-m'\x3e");
            b.push(c);
            b.push("\x3c/div\x3e");
            b.push("\x3cdiv class\x3d'col-hidden col-weekHeader col-weekHeader-m'\x3e");
            b.push(c);
            b.push("\x3c/div\x3e");
            b.push("\x3c/div\x3e");
            b.push("\x3cdiv id\x3d'%s' class\x3d'animationWrapper'\x3e".format(this.id("animation")));
            b.push("\x3cdiv id\x3d'%s' class\x3d'keel-grid monthsGrid'\x3e".format(this.id("months")))
        }
        b.push(this.makeCalendarHTML(currentDate));
        this.existing || (b.push("\x3c/div\x3e"), b.push("\x3c/div\x3e"), b.push("\x3c/div\x3e"), b.push("\x3c/div\x3e"));
        return b.join("")
    }
    getCssClass() {
        return "Common-Widgets-Calendar"
    }
    makeAboveCalendarHTML() {
        return ""
    }
    makeNavHTML(currentDate) {
        var b = this.checkDate(currentDate.clone().add(-1, "month")) ? "" : "disabled";
        currentDate = this.checkDate(currentDate.clone().add(1, "month")) ? "" : "disabled";
        var c = [];
        c.push("\x3cdiv id\x3d'%s' tabindex\x3d'0' role\x3d'button' %s aria-label\x3d'Previous month' class\x3d'navItem prevMonth %s'\x3e%s\x3c/div\x3e".format(this.id("prev"),
            b ? "disabled\x3d'disabled'" : "", b, this.leftArrow));
        c.push("\x3cdiv id\x3d'%s' tabindex\x3d'0' role\x3d'button' %s aria-label\x3d'Next month' class\x3d'navItem nextMonth %s'\x3e%s\x3c/div\x3e".format(this.id("next"), currentDate ? "disabled\x3d'disabled'" : "", currentDate, this.rightArrow));
        return c.join("")
    }
    makeWeekHeaderHTML(a, b) {
        var c = [];
        c.push("\x3cdiv class\x3d'keel-grid weekDayGrid %s' %s\x3e".format(a ? "hide" : "", a ? "role\x3d'row'" : "aria-hidden\x3d'true'"));
        for (var e = moment().startOf("week"), d = 0; 7 > d; d++)
            c.push("\x3cdiv class\x3d'col-weekDay'\x3e\x3cdiv %s class\x3d'weekDay' %s\x3e%s\x3c/div\x3e\x3c/div\x3e".format(b ?
                "id\x3d'%s-%s'".format(b, d) : "", a ? "role\x3d'columnheader'" : "", e.format("dd").substr(0, 1))), e.add(1, "day");
        c.push("\x3c/div\x3e");
        return c.join("")
    }
    makeCalendarHTML(currentDate) {
        var b = [];
        b.push(this.makeMonthHTML(currentDate.clone(), -1));
        b.push(this.makeMonthHTML(currentDate.clone(), 0));
        b.push(this.makeMonthHTML(currentDate.clone(), 1));
        b.push(this.makeMonthHTML(currentDate.clone(), 2));
        return b.join("")
    }
    makeMonthHTML(a, b) {
        var c = [];
        a = a.clone().add(b, "month").startOf("month");
        var e = a.month(),
            d = this.id(a.format("YYYYMM"));
        b = -1 === b ||
        2 === b;
        c.push("\x3cdiv id\x3d'%s' class\x3d'col col-month col-month-m %s' role\x3d'grid' aria-readonly\x3d'true' aria-hidden\x3d'%s'\x3e".format(d, b ? "col-hidden" : "", b));
        c.push("\x3cdiv class\x3d'month'\x3e");
        c.push("\x3cdiv class\x3d'monthDisplay'\x3e%s\x3c/div\x3e".format(a.format(this.options.monthTitleFormat)));
        c.push(this.makeWeekHeaderHTML(!0, d));
        c.push("\x3cdiv class\x3d'weeks'\x3e");
        c.push("\x3cdiv class\x3d'keel-grid weekGrid' role\x3d'row'\x3e");
        for (b = 0; b < a.weekday(); b++)
            c.push(this.makeDayHTML(d));
        for (; a.month() == e;)
            c.push(this.makeDayHTML(d, a)), 6 === a.weekday() && c.push("\x3c/div\x3e\x3cdiv class\x3d'keel-grid weekGrid' role\x3d'row'\x3e"), a.add(1, "day");
        a.add(-1, "day");
        c.push("\x3c/div\x3e");
        c.push("\x3c/div\x3e");
        c.push("\x3c/div\x3e");
        c.push("\x3c/div\x3e");
        return c.join("")
    }
    makeDayTipHTML() {
        return ""
    }
    makeDayHTML(a, b) {
        var c = "",
            e = "",
            d = "",
            f = -1,
            g = "";
        b ? (this.checkDate(b) ? (b.isSame(this.now) && (c = "today"), f = 0) : c = "disabled", e = b.date(), g = "aria-describedby\x3d'%s-%s'".format(a,
            b.weekday()), d = "data-val\x3d'%s'".format(b.valueOf())) : c = "empty";
        return "\x3cdiv %s class\x3d'col-day %s' role\x3d'gridcell' %s tabindex\x3d'%s'\x3e\x3cdiv class\x3d'day'\x3e%s\x3c/div\x3e\x3c/div\x3e".format(d, c, g, f, e)
    }
}
new AccessibleDatepicker();