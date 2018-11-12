var jsCalendar = (function(){

   
    function JsCalendar(){
       
        if (arguments.length === 0) {
           
            return;
        }
        else {
          
            this._construct(arguments);
        }
    }

    JsCalendar.prototype._construct = function(args) {
        
        args = this._parseArguments(args);
      
        this._init(args.options);
       
        this._setTarget(args.target);
        this._initTarget();
        
        this._setDate(args.date);
        
        this._create();
      
        this._update();
    };

   
    JsCalendar.prototype.languages = {
        
        en : {
            
            months : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
           
            days : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            
            _dateStringParser : function(key, date) {return JsCalendar._defaultDateStringParser(key, date, this);},
            _dayStringParser : function(key, date) {return JsCalendar._defaultDayStringParser(key, date, this);}
        }
    };

   
    JsCalendar.prototype._init = function(options) {
        
        this._elements = {};
        
        this._events = {};
        this._events.date = [];
        this._events.month = [];
        
        this._now = null;
        this._date = null;
        this._selected = [];
        
        this.language = {};
        
        this._parseOptions(options);
    };

    
    JsCalendar.prototype._parseArguments = function(args) {
        
        var obj = {
            target : null,
            date : new Date(),
            options : {}
        };

      
        if (args.length === 0) {
            
            throw new Error('jsCalendar: No parameters were given.');
        }

        
        else if (args.length === 1) {

            
            if (
                (
                    
                    ((typeof HTMLElement === 'object') ? (args[0] instanceof HTMLElement) : args[0]) &&
                    (typeof args[0] === 'object') && (args[0] !== null) && (args[0].nodeType === 1) &&
                    (typeof args[0].nodeName === 'string')
                ) || (
                   
                    typeof args[0] === 'string'
                )
            ) {
                obj.target = args[0];
            }

           
            else {
                
                obj.options = args[0];
                
                if (typeof args[0].target !== 'undefined') {
                    obj.target = args[0].target;
                }
                else {
                    
                    throw new Error('jsCalendar: Not target was given.');
                }
               
                if (typeof args[0].date !== 'undefined') {
                    obj.date = args[0].date;
                }
            }
        }

        
        else {

            
            obj.target = args[0];

            
            if (args.length >= 2) {
                obj.date = args[1];
            }

            
            if (args.length >= 3) {
                obj.options = args[2];
            }

        }

        
        return obj;
    };

   
    JsCalendar.prototype._parseOptions = function(options) {
      
        this._options = {
            language : 'en',
            zeroFill : false,
            monthFormat : 'month',
            dayFormat : 'D',
            firstDayOfTheWeek : 1,
            navigator : true,
            navigatorPosition : 'both',
            min : false,
            max : false
        };
       
        if (typeof options.zeroFill !== 'undefined'){
            if (options.zeroFill === 'false' || !options.zeroFill) {
                this._options.zeroFill = false;
            }
            else {
                this._options.zeroFill = true;
            }
        }
        if (typeof options.monthFormat !== 'undefined'){
            this._options.monthFormat = options.monthFormat;
        }
        if (typeof options.dayFormat !== 'undefined'){
            this._options.dayFormat = options.dayFormat;
        }
        if (typeof options.navigator !== 'undefined'){
            if (options.navigator === 'false' || !options.navigator) {
                this._options.navigator = false;
            }
            else {
                this._options.navigator = true;
            }
        }
        if (typeof options.navigatorPosition !== 'undefined'){
            this._options.navigatorPosition = options.navigatorPosition;
        }

      
        if (typeof options.language === 'string' && typeof this.languages[options.language] !== 'undefined'){
            this._options.language = options.language;
        }
       
        this.setLanguage(this._options.language);

       
        if (typeof options.fdotw !== 'undefined'){
            options.firstDayOfTheWeek = options.fdotw;
        }
        if (typeof options.firstDayOfTheWeek !== 'undefined'){
            
            if (typeof options.firstDayOfTheWeek === 'number') {
             
                if (options.firstDayOfTheWeek >= 1 && options.firstDayOfTheWeek <= 7) {
                    this._options.firstDayOfTheWeek = options.firstDayOfTheWeek;
                }
            }
            
            if (typeof options.firstDayOfTheWeek === 'string') {
                
                if (options.firstDayOfTheWeek.match(/^[1-7]$/)) {
                    this._options.firstDayOfTheWeek = parseInt(options.firstDayOfTheWeek, 10);
                }
               
                else {
                    
                    this._options.firstDayOfTheWeek = this.language.days.indexOf(options.firstDayOfTheWeek) + 1;

                   
                    if (this._options.firstDayOfTheWeek < 1 || this._options.firstDayOfTheWeek > 7) {
                        this._options.firstDayOfTheWeek = 1;
                    }
                }
            }
        }

        if (typeof options.min !== 'undefined' && options.min !== 'false' && options.min !== false) {
          
            this._options.min = this._parseDate(options.min);
        }
     
        if (typeof options.max !== 'undefined' && options.max !== 'false' && options.max !== false) {
          
            this._options.max = this._parseDate(options.max);
        }
    };

    
    JsCalendar.prototype._setTarget = function(element) {
      
        var target = this._getElement(element);
     
        if (!target) {
           
            throw new Error('jsCalendar: Target was not found.');
        }
        else {
           
            this._target = target;

            
            this._target_id = this._target.id;
            if (this._target_id && this._target_id.length > 0) {
                jsCalendarObjects['#' + this._target_id] = this;
            }
        }
    };

   
    JsCalendar.prototype._getElement = function(element) {
        
        if (!element) {
            return null;
        }

      
        if (typeof element === 'string') {
          
            if (element[0] === '#') {
                return document.getElementById(element.substring(1));
            }
           
            else if (element[0] === '.') {
                return document.getElementsByClassName(element.substring(1))[0];
            }
        }
        
       
        else if (element.tagName && element.nodeName && element.ownerDocument && element.removeAttribute) {
            return element;
        }

      
        return null;
    };

    JsCalendar.prototype._initTarget = function() {
     
        if (this._target.className.length > 0){
            this._target.className += ' ';
        }
        this._target.className += 'jsCalendar';

       
        this._elements.table = document.createElement('table');
        
        this._elements.head = document.createElement('thead');
        this._elements.table.appendChild(this._elements.head);
        
        this._elements.body = document.createElement('tbody');
        this._elements.table.appendChild(this._elements.body);

      
        this._target.appendChild(this._elements.table);
    };

  
    JsCalendar.prototype._isDateInRange = function(date) {
        
        if (this._options.min === false && this._options.max === false) {
            return true;
        }

       
        date = this._parseDate(date);
        
     
        if (this._options.min !== false && this._options.min.getTime() > date.getTime()) {
            return false;
        }
       
        if (this._options.max !== false && this._options.max.getTime() < date.getTime()) {
            return false;
        }

    
        return true;
    };

 
    JsCalendar.prototype._setDate = function(date) {
        
        if (!this._isDateInRange(date)) {
            return;
        }
        
        this._now = this._parseDate(date);
        this._date = new Date(this._now.getFullYear(), this._now.getMonth(), 1);
    };

    
    JsCalendar.prototype._parseDate = function(date) {

       
        if (typeof date === 'undefined' || date === null || date === 'now') {
          
            date = new Date();
        }

        else if (typeof date === 'string') {
            
            date = date.replace(/-/g,'/').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4,4})$/i);
            
            if (date !== null) {
                var month_index = parseInt(date[2], 10) - 1;
                
                date = new Date(date[3], month_index, date[1]);
               
                if (!date || date.getMonth() !== month_index) {
                    
                    throw new Error('jsCalendar: Date does not exist.');
                }
            }
           
            else {
                
                throw new Error('jsCalendar: Failed to parse date.');
            }
        }

       
        else if (typeof date === 'number') {
          
            date = new Date(date);
        }

         
        else if (!(date instanceof Date)) {
            
            throw new Error('jsCalendar: Invalid date.');
        }

        
        return new Date(date.getTime());
    };

   
    JsCalendar.prototype._parseToDateString = function(date, format) {
        var lang = this.language;
        return format.replace(/(MONTH|month|MMM|mmm|mm|m|MM|M|DAY|day|DDD|ddd|dd|d|DD|D|YYYY|yyyy)/g, function(key) {
            return lang.dateStringParser(key, date);
        });
    };

    
    JsCalendar.prototype._getVisibleMonth = function(date) {
        
        if (typeof date === 'undefined') {
            
            date = this._date;
        }
        else {
            date = this._parseDate(date);
        }

       
        var first = new Date(date.getTime());
        first.setDate(1);

    
        var firstDay = first.getDay() - (this._options.firstDayOfTheWeek - 1);
        if (firstDay < 0) {
            firstDay += 7;
        }

        var lang = this.language;
        var name = this._options.monthFormat.replace(/(MONTH|month|MMM|mmm|##|#|YYYY|yyyy)/g, function(key) {
            return lang.dateStringParser(key, first);
        });

        
        var days = this._getVisibleDates(date);
        var daysInMonth = new Date(first.getYear() + 1900, first.getMonth() + 1, 0).getDate();

        var current = -1;
        
        if (first.getYear() === this._now.getYear() && first.getMonth() === this._now.getMonth()) {
            
            current = firstDay + this._now.getDate() - 1;
        }

        
        return {
            name : name,
            days : days,
            start : firstDay + 1,
            current : current,
            end : firstDay + daysInMonth
        };
    };

    
    JsCalendar.prototype._getVisibleDates = function(date) {
       
        if (typeof date === 'undefined') {
            
            date = this._date;
        }
        else {
            date = this._parseDate(date);
        }

      
        var dates = [];
      
        var first = new Date(date.getTime());
        first.setDate(1);
        first.setHours(0, 0, 0, 0);

      
        var previous = first.getDay() - (this._options.firstDayOfTheWeek - 1);
        if (previous < 0) {
            previous += 7;
        }
      
        var day = new Date(first.getTime());
      
        while (previous > 0) {
           
            day.setDate(day.getDate() - 1);
            
            dates.unshift(new Date(day.getTime()));
          
            previous --;
        }

        day = new Date(first.getTime());
       
        do {
           
            dates.push(new Date(day.getTime()));
            
            day.setDate(day.getDate() + 1);
            
        } while (day.getDate() !== 1);

    
        var next = 42 - dates.length;
       
        while (next > 0) {
           
            dates.push(new Date(day.getTime()));
            
            day.setDate(day.getDate() + 1);
            
            next --;
        }

        // Return days
        return dates;
    };

    
    JsCalendar.prototype._create = function() {
        var i, j;
        
        var that = this;

        this._elements.created = true;

       
        this._elements.headRows = [];
        for (i = 0; i < 2; i++) {
            this._elements.headRows.push(document.createElement('tr'));
            this._elements.head.appendChild(this._elements.headRows[i]);
        }

      
        var title_header = document.createElement('th');
        title_header.setAttribute('colspan', 7);
        this._elements.headRows[0].className = 'jsCalendar-title-row';
        this._elements.headRows[0].appendChild(title_header);

        this._elements.headLeft = document.createElement('div');
        this._elements.headLeft.className = 'jsCalendar-title-left';
        title_header.appendChild(this._elements.headLeft);
        this._elements.month = document.createElement('div');
        this._elements.month.className = 'jsCalendar-title-name';
        title_header.appendChild(this._elements.month);
        this._elements.headRight = document.createElement('div');
        this._elements.headRight.className = 'jsCalendar-title-right';
        title_header.appendChild(this._elements.headRight);

       
        if (this._options.navigator) {
            this._elements.navLeft = document.createElement('div');
            this._elements.navLeft.className = 'jsCalendar-nav-left';
            this._elements.navRight = document.createElement('div');
            this._elements.navRight.className = 'jsCalendar-nav-right';

            if (this._options.navigatorPosition === 'left') {
                this._elements.headLeft.appendChild(this._elements.navLeft);
                this._elements.headLeft.appendChild(this._elements.navRight);
            }
            else if (this._options.navigatorPosition === 'right') {
                this._elements.headRight.appendChild(this._elements.navLeft);
                this._elements.headRight.appendChild(this._elements.navRight);
            }
            else {
                this._elements.headLeft.appendChild(this._elements.navLeft);
                this._elements.headRight.appendChild(this._elements.navRight);
            }

           
            this._elements.navLeft.addEventListener('click', function(event){
                that.previous();
                that._eventFire_monthChange(event, that._date);
            }, false);
            this._elements.navRight.addEventListener('click', function(event){
                that.next();
                that._eventFire_monthChange(event, that._date);
            }, false);
        }

       
        this._elements.headRows[1].className = 'jsCalendar-week-days';
        title_header.className = 'jsCalendar-title';
        this._elements.days = [];
        var name, dayIndex, lang = this.language;
        for (i = 0; i < 7; i++) {
            this._elements.days.push(document.createElement('th'));
            this._elements.headRows[1].appendChild(this._elements.days[
                this._elements.days.length - 1
            ]);

            dayIndex = (i + this._options.firstDayOfTheWeek - 1) % 7;
            name = this._options.dayFormat.replace(/(DAY|day|DDD|ddd|DD|dd|D)/g, function(key) {
                return lang.dayStringParser(key, dayIndex);
            });
            this._elements.days[this._elements.days.length - 1].textContent = name;
        }

       
        this._elements.bodyRows = [];
        this._elements.bodyCols = [];
       
        for (i = 0; i < 6; i++) {
            this._elements.bodyRows.push(document.createElement('tr'));
            this._elements.body.appendChild(this._elements.bodyRows[i]);
            
            for (j = 0; j < 7; j++) {
                this._elements.bodyCols.push(document.createElement('td'));
                this._elements.bodyRows[i].appendChild(this._elements.bodyCols[i * 7 + j]);
                this._elements.bodyCols[i * 7 + j].addEventListener('click', (function(index){
                    return function (event) {
                        that._eventFire_dateClick(event, that._active[index]);
                    };
                })(i * 7 + j), false);
            }
        }
    };

    
    JsCalendar.prototype._selectDates = function(dates) {
      
        dates = dates.slice();

       
        for (var i = 0; i < dates.length; i++) {
            dates[i] = this._parseDate(dates[i]);
            dates[i].setHours(0, 0, 0, 0);
            dates[i] = dates[i].getTime();
        }

     
        for (i = dates.length - 1; i >= 0; i--) {
            
            if (this._selected.indexOf(dates[i]) < 0) {
                this._selected.push(dates[i]);
            }
        }
    };

   
    JsCalendar.prototype._unselectDates = function(dates) {
       
        dates = dates.slice();

      
        for (var i = 0; i < dates.length; i++) {
            dates[i] = this._parseDate(dates[i]);
            dates[i].setHours(0, 0, 0, 0);
            dates[i] = dates[i].getTime();
        }

        var index;
        for (i = dates.length - 1; i >= 0; i--) {
           
            index = this._selected.indexOf(dates[i]);
            if (index >= 0) {
                this._selected.splice(index, 1);
            }
        }
    };

   
    JsCalendar.prototype._unselectAllDates = function() {
        
        while (this._selected.length) {
            this._selected.pop();
        }
    };

   
    JsCalendar.prototype._update = function() {
        
        var month = this._getVisibleMonth(this._date);
       
        this._active = month.days.slice();
        
        this._elements.month.textContent = month.name;

       
        var prefix = '';
        if (this._options.zeroFill) {
            prefix = '0';
        }

       
        var text;
        for (var i = month.days.length - 1; i >= 0; i--) {
            text = month.days[i].getDate();
            this._elements.bodyCols[i].textContent = (text < 10 ? prefix + text : text);

            if (this._selected.indexOf(month.days[i].getTime()) >= 0) {
                this._elements.bodyCols[i].className = 'jsCalendar-selected';
            }
            else {
                this._elements.bodyCols[i].removeAttribute('class');
            }
        }

       
        for (i = 0; i < month.start - 1; i++) {
            this._elements.bodyCols[i].className = 'jsCalendar-previous';
        }
        
        if(month.current >= 0){
            if (this._elements.bodyCols[month.current].className.length > 0) {
                this._elements.bodyCols[month.current].className += ' jsCalendar-current';
            }
            else {
                this._elements.bodyCols[month.current].className = 'jsCalendar-current';
            }
        }
        
        for (i = month.end; i < month.days.length; i++) {
            this._elements.bodyCols[i].className = 'jsCalendar-next';
        }
    };

    
    JsCalendar.prototype._eventFire_dateClick = function(event, date) {
        
        for (var i = 0; i < this._events.date.length; i++) {
            (function(callback) {
                
                setTimeout(function(){
                    
                    callback(event, new Date(date.getTime()));
                }, 0);
            })(this._events.date[i]);
        }
    };

    
    JsCalendar.prototype._eventFire_monthChange = function(event, date) {
        
        var month = new Date(date.getTime());
        month.setDate(1);
        
        for (var i = 0; i < this._events.month.length; i++) {
            (function(callback) {
                
                setTimeout(function(){
                   
                    callback(event, new Date(month.getTime()));
                }, 0);
            })(this._events.month[i]);
        }
    };

   
    JsCalendar.prototype.onDateClick = function(callback) {
        
        if(typeof callback === 'function'){
            
            this._events.date.push(callback);
        }

        
        else {
            
            throw new Error('jsCalendar: Invalid callback function.');
        }

        
        return this;
    };

    
    JsCalendar.prototype.onMonthChange = function(callback) {
        
        if(typeof callback === 'function'){
            
            this._events.month.push(callback);
        }

        
        else {
            
            throw new Error('jsCalendar: Invalid callback function.');
        }

      
        return this;
    };

   
    JsCalendar.prototype.set = function(date){
        
        this._setDate(date);
        
        this.refresh();

       
        return this;
    };

  
    JsCalendar.prototype.min = function(date){
       
        if (date) {
            
            this._options.min = this._parseDate(date);
        }
        
        else {
            this._options.min = false;
        }

        
        this.refresh();

        
        return this;
    };

   
    JsCalendar.prototype.max = function(date){
        
        if (date) {
            
            this._options.max = this._parseDate(date);
        }
        
        else {
            this._options.max = false;
        }

        
        this.refresh();

        
        return this;
    };

   
    JsCalendar.prototype.refresh = function(date) {
     
        if (typeof date !== 'undefined') {
            
            if (this._isDateInRange(date)) {
                this._date = this._parseDate(date);
            }
        }

        if (this._elements.created === true) {
            this._update();
        }

        
        return this;
    };

    
    JsCalendar.prototype.next = function(n){
        
        if (typeof n !== 'number') {
            n = 1;
        }

        
        var date = new Date(this._date.getFullYear(), this._date.getMonth() + n, 1);

        
        if (!this._isDateInRange(date)) {
            return this;
        }

        
        this._date = date;
        this.refresh();

       
        return this;
    };

   
    JsCalendar.prototype.previous = function(n){
        
        if (typeof n !== 'number') {
            n = 1;
        }

      
        var date = new Date(this._date.getFullYear(), this._date.getMonth() - n, 1);

       
        if (!this._isDateInRange(date)) {
            return this;
        }

        
        this._date = date;
        this.refresh();

        return this;
    };

    
    JsCalendar.prototype.goto = function(date){
        this.refresh(date);

      
        return this;
    };

   
    JsCalendar.prototype.reset = function(){
        this.refresh(this._now);

       
        return this;
    };

   
    JsCalendar.prototype.select = function(dates){
      
        if (typeof dates === 'undefined') {
           
            return this;
        }

        
        if (!(dates instanceof Array)) {
           
            dates = [dates];
        }
        
        this._selectDates(dates);
        
        this.refresh();

        
        return this;
    };

    
    JsCalendar.prototype.unselect = function(dates){
       
        if (typeof dates === 'undefined') {
           
            return this;
        }

       
        if (!(dates instanceof Array)) {
           
            dates = [dates];
        }
       
        this._unselectDates(dates);
      
        this.refresh();

       
        return this;
    };

    
    JsCalendar.prototype.clearselect = function(){
        
        this._unselectAllDates();
        
        this.refresh();

      
        return this;
    };
    
    JsCalendar.prototype.clearSelected = JsCalendar.prototype.clearselect;

    
    JsCalendar.prototype.getSelected = function(options){
        
        if (typeof options !== 'object') {
            options = {};
        }

       
        var dates = this._selected.slice();

        if (options.sort) {
            if (options.sort === true) {
                dates.sort();
            }
            else if (typeof options.sort === 'string') {
                if (options.sort.toLowerCase() === 'asc') {
                    dates.sort();
                }
                else if (options.sort.toLowerCase() === 'desc'){
                    dates.sort();
                    dates.reverse();
                }
            }
        }

      
        if (options.type && typeof options.type === 'string') {
            var i;
            
            if (options.type.toLowerCase() === 'date'){
                for (i = dates.length - 1; i >= 0; i--) {
                    dates[i] = new Date(dates[i]);
                }
            }
            
            else if (options.type.toLowerCase() !== 'timestamp') {
                for (i = dates.length - 1; i >= 0; i--) {
                    dates[i] = this._parseToDateString(new Date(dates[i]), options.type);
                }
            }
        }

      
        return dates;
    };

    
    JsCalendar.prototype.isSelected = function(date){
      
        if (typeof date === 'undefined' || date === null) {
           
            return false;
        }

       
        date = this._parseDate(date);
        date.setHours(0, 0, 0, 0);
        date = date.getTime();

       
        if (this._selected.indexOf(date) >= 0) {
            return true;
        }
       
        else {
            return false;
        }
    };

  
    JsCalendar.prototype.isVisible = function(date){
        
        if (typeof date === 'undefined' || date === null) {
           
            return false;
        }

       
        date = this._parseDate(date);
        date.setHours(0, 0, 0, 0);
        date = date.getTime();

        
        var visible = this._getVisibleDates();
      
        if (visible[0].getTime() <= date && visible[visible.length - 1].getTime() >= date) {
            return true;
        }
      
        else {
            return false;
        }
    };

   
    JsCalendar.prototype.isInMonth = function(date){
       
        if (typeof date === 'undefined' || date === null) {
           
            return false;
        }

        
        var month = this._parseDate(date);
        month.setHours(0, 0, 0, 0);
        month.setDate(1);

        
        var active = this._parseDate(this._date);
        active.setHours(0, 0, 0, 0);
        active.setDate(1);
        
      
        if (month.getTime() === active.getTime()) {
            return true;
        }
       
        else {
            return false;
        }
    };

  
    JsCalendar.prototype.setLanguage = function(code) {
       
        if (typeof code !== 'string'){
          
            throw new Error('jsCalendar: Invalid language code.');
        }
        if (typeof this.languages[code] === 'undefined'){
            
            throw new Error('jsCalendar: Language not found.');
        }

       
        this._options.language = code;

        var language = this.languages[code];
        this.language.months = language.months;
        this.language.days = language.days;
        this.language.dateStringParser = language._dateStringParser;
        this.language.dayStringParser = language._dayStringParser;

       
        this.refresh();

        
        return this;
    };

    JsCalendar.autoFind = function(){
       
        var calendars = document.getElementsByClassName('auto-jsCalendar');
        
        var options;
        
        for (var i = 0; i < calendars.length; i++) {
           
            if(calendars[i].getAttribute('jsCalendar-loaded') !== 'true') {
               
                calendars[i].setAttribute('jsCalendar-loaded', 'true');
                
                options = {};
                
                for(var j in calendars[i].dataset){
                    options[j] = calendars[i].dataset[j];
                }
                
                options.target = calendars[i];
                
                new jsCalendar(options);
            }
        }
    };
    
    
    JsCalendar.tools = {};
    
    JsCalendar.tools.parseDate = function() {
        return JsCalendar.prototype._parseDate.apply({}, arguments);
    };
    JsCalendar.tools.stringToDate = JsCalendar.tools.parseDate;
    
    JsCalendar.tools.dateToString = function(date, format, lang) {
        
        var languages = JsCalendar.prototype.languages;
        if (!lang || !languages.hasOwnProperty(lang)) {
            lang = 'en';
        }

       
        return JsCalendar.prototype._parseToDateString.apply(
            {language : {
                months : languages[lang].months,
                days : languages[lang].days,
                dateStringParser : languages[lang]._dateStringParser,
                dayStringParser : languages[lang]._dayStringParser
            }},
            [date, format]
        );
    };
    
   
    JsCalendar.new = function(){
      
        var obj = new JsCalendar();
       
        obj._construct(arguments);
        
        return obj;
    };
    
    
    var jsCalendarObjects = {};
    JsCalendar.set = function(identifier, calendar){
        if (calendar instanceof jsCalendar) {
            jsCalendarObjects[identifier] = calendar;
            return true;
        }
        throw new Error('jsCalendar: The second parameter is not a jsCalendar.');
    };
    JsCalendar.get = function(identifier){
        if (jsCalendarObjects.hasOwnProperty(identifier)) {
            return jsCalendarObjects[identifier];
        }
        return null;
    };
    JsCalendar.del = function(identifier){
        if (jsCalendarObjects.hasOwnProperty(identifier)) {
            delete jsCalendarObjects[identifier];
            return true;
        }
        return false;
    };
    
   
    JsCalendar.addLanguage = function(language){
        
        if (typeof language === 'undefined') {
           
            throw new Error('jsCalendar: No language object was given.');
        }
       
        if (typeof language.code !== 'string') {
            
            throw new Error('jsCalendar: Invalid language code.');
        }
        
        if (!(language.months instanceof Array)) {
            
            throw new Error('jsCalendar: Invalid language months.');
        }
        if (language.months.length !== 12) {
            
            throw new Error('jsCalendar: Invalid language months length.');
        }
        
        if (!(language.days instanceof Array)) {
           
            throw new Error('jsCalendar: Invalid language days.');
        }
        if (language.days.length !== 7) {
           
            throw new Error('jsCalendar: Invalid language days length.');
        }

        
        JsCalendar.prototype.languages[language.code] = language;

       
        language._dateStringParser = (
            language.hasOwnProperty('dateStringParser') ?
            function(key, date) {return language.dateStringParser(key, date) || JsCalendar._defaultDateStringParser(key, date, language);} :
            function(key, date) {return JsCalendar._defaultDateStringParser(key, date, language);}
        );
        language._dayStringParser = (
            language.hasOwnProperty('dayStringParser') ?
            function(key, day) {return language.dayStringParser(key, day) || JsCalendar._defaultDayStringParser(key, day, language);} :
            function(key, day) {return JsCalendar._defaultDayStringParser(key, day, language);}
        );
    };

    
    JsCalendar._defaultDateStringParser = function(key, date, lang){
        switch(key) {
            case 'MONTH':
            case 'month':
                return lang.months[date.getMonth()];
            case 'MMM':
            case 'mmm':
                return lang.months[date.getMonth()].substring(0, 3);
            case 'mm':
                return lang.months[date.getMonth()].substring(0, 2);
            case 'm':
                return lang.months[date.getMonth()].substring(0, 1);
            case 'MM':
                return (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
            case 'M':
                return date.getMonth() + 1;
            case '##':
                return (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
            case '#':
                return date.getMonth() + 1;
            case 'DAY':
            case 'day':
                return lang.days[date.getDay()];
            case 'DDD':
            case 'ddd':
                return lang.days[date.getDay()].substring(0, 3);
            case 'dd':
                return lang.days[date.getDay()].substring(0, 2);
            case 'd':
                return lang.days[date.getDay()].substring(0, 1);
            case 'DD':
                return (date.getDate() <= 9 ? '0' : '') + date.getDate();
            case 'D':
                return date.getDate();
            case 'YYYY':
            case 'yyyy':
                return date.getYear() + 1900;
        }
    };

    
    JsCalendar._defaultDayStringParser = function(key, day, lang){
        switch(key) {
            case 'DAY':
            case 'day':
                return lang.days[day];
            case 'DDD':
            case 'ddd':
                return lang.days[day].substring(0, 3);
            case 'DD':
            case 'dd':
                return lang.days[day].substring(0, 2);
            case 'D':
                return lang.days[day].substring(0, 1);
        }
    };

  
    (function(){
       
        if (typeof window.jsCalendar_language2load !== 'undefined') {
         
            while (window.jsCalendar_language2load.length) {
              
                setTimeout((function (language) {
                   
                    return function() {
                        JsCalendar.addLanguage(language);
                    };
                })(window.jsCalendar_language2load.pop()), 0);
            }
            
            delete window.jsCalendar_language2load;
        }
    })();

  
    return JsCalendar;
})();


(function(){
  
    window.addEventListener('load', function() {
       
        jsCalendar.autoFind();
    }, false);
})();
