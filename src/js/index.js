'use strict';
class AccessibleDatepicker{

    constructor(){
        this.now = moment().startOf("day");
        this.maxDate = moment().add(1, "year");
        this.existing = false;
        this._id = 'com-cal';
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
    }
    id(){
        return this._id;
    }
    checkDate(currDate) {
        return currDate.isBefore(this.now) && !this.options.allowPastDates || currDate.isAfter(this.maxDate) || null !== this.minDate && currDate.isBefore(this.minDate) ? false : true;
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