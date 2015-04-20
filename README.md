Firebase adapter for dhtmlxScheduler
=============================

Library allows using [dhtmlxScheduler](http://dhtmlx.com/docs/products/dhtmlxScheduler) components with [FireBase](https://firebase.com/)

Citing the Firebase site:

When data changes, apps built with Firebase update instantly across every device -- web or mobile.

Firebase-powered apps work offline. Data is synchronized instantly when your app regains connectivity.


How to use
-----------

Include dhtmlxScheduler and Firebase files on the page

```html
<!-- dhtmlxScheduler -->
<!-- ... -->

<!-- dhtmlxScheduler-Firebase adapter -->
<script type="text/javascript" src="../source/dhtmlx_scheduler_firebase.js"></script>

<!-- FireBase -->
<script src="https://cdn.firebase.com/js/client/2.2.4/firebase.js"></script>
```
Create html for dhtmlxScheduler

```html
    <div id="scheduler_here" class="dhx_cal_container" style="width: 100%; height: 500px;">
        <div class="dhx_cal_navline">
            <div class="dhx_cal_prev_button">&nbsp;</div>
            <div class="dhx_cal_next_button">&nbsp;</div>
            <div class="dhx_cal_today_button"></div>
            <div class="dhx_cal_date"></div>
            <div class="dhx_cal_tab" name="day_tab" style="right: 332px;"></div>
            <div class="dhx_cal_tab" name="week_tab" style="right: 268px;"></div>
            <div class="dhx_cal_tab" name="month_tab" style="right: 204px;"></div>
            <div class="dhx_cal_tab" name="year_tab" style="right: 140px;"></div>
        </div>
        <div class="dhx_cal_header"></div>
        <div class="dhx_cal_data"></div>
    </div>
```

Init dhtmlxScheduler

```js
    scheduler.init("scheduler_here");
```

Create firebase connection and set this to scheduler

```js
    var data = new Firebase("https://dhtmlxschedulertest.firebaseio.com"),
        events = data.child("events");

    scheduler.firebase(events);
```

Stop the data adapter

```js
    scheduler.firebaseStop();
```

That is it.

License
----------

DHTMLX is published under the GPLv3 license.

License:

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
	to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
	IN THE SOFTWARE.


Copyright (c) 2015 DHTMLX