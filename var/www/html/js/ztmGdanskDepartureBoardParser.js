var ztmGdanskDepartureBoardParser = {
    setDepartureBoard: function (divTableId, stopId, stopName, displayCode) {

        $.getJSON("https://ckan2.multimediagdansk.pl/delays?stopId=" + stopId, function (result) {
            if (typeof result.error !== 'undefined') {
                console.log(result.error);
            }
            else {
                var table = document.getElementById(divTableId);
                table.innerHTML = "";

                var div1 = document.createElement('div');
                var tr, th, span;

                // Creating INFO row
                var tb1 = document.createElement('table');
                tb1.id = "infoDeparturesBoard";

                tr = tb1.insertRow();

                th = tr.insertCell();
                th.id = "blank";
                th = tr.insertCell();
                th.id = "stopName";
                th.innerText = stopName;
                th = tr.insertCell();
                th.style.textAlign = "right";
                span = document.createElement('span');
                span.id = "lastUpdateTime";
                span.innerText = result.lastUpdate.split(" ")[1];
                th.appendChild(span);

                tr = tb1.insertRow();
                th = tr.insertCell();
                th = tr.insertCell();
                th = tr.insertCell();

                div1.appendChild(tb1);

                // Creating HEADERS row
                var tb2 = document.createElement('table');
                tb2.id = "headerDeparturesBoard";
                tb2.style.borderBottom = "0px";

                tr = tb2.insertRow();

                th = tr.insertCell();
                th.className = "route";
                th.innerText = "LINIA";
                th = tr.insertCell();
                th.className = "dir";
                th.innerText = "KIERUNEK DOCELOWY";
                th = tr.insertCell();
                th.className = "time";
                th.innerText = "ODJAZD";

                div1.appendChild(tb2);
                table.appendChild(div1);

                // Creating TIMES rows
                var div2 = document.createElement('div');

                var tb3 = document.createElement('table');
                tb3.id = "timesDeparturesBoard";

                for (let index = 0; index < result.delay.length; index++) {
                    tr = tb3.insertRow();

                    th = tr.insertCell();
                    th.className = "route";
                    span = document.createElement('span');
                    span.innerText = result.delay[index].routeId > 400 && result.delay[index].routeId < 500 ? "N" + (result.delay[index].routeId - 400).toString() : result.delay[index].routeId.toString();
                    th.appendChild(span);
                    th = tr.insertCell();
                    th.className = "dir";
                    span = document.createElement('span');
                    span.innerText = result.delay[index].headsign;
                    th.appendChild(span);
                    th = tr.insertCell();
                    th.className = "time";
                    span = document.createElement('span');
                    if (result.delay[index].status === "REALTIME") {
                        if (result.delay[index].delayInSeconds > 300) //delay 5 min
                        {
                            span.style.color = "red";
                        }
                        else if (result.delay[index].delayInSeconds < -60) //advance 1 min
                        {
                            span.style.color = "lime";
                        }
                    }
                    else {
                        span.style.color = "yellow";
                    }

                    var temp = result.delay[index].estimatedTime.split(":");
                    var estimatedHours = parseInt(temp[0]);
                    var estimatedMinutes = parseInt(temp[1]);
                    var now = new Date();
                    var estimatedTime = new Date();
                    if (estimatedHours < now.getHours()) {
                        estimatedTime.setDay(estimatedTime.getDate() + 1);
                        estimatedTime.setHours(estimatedHours);
                        estimatedTime.setMinutes(estimatedMinutes);
                    }
                    else {
                        estimatedTime.setHours(estimatedHours);
                        estimatedTime.setMinutes(estimatedMinutes);
                    }
                    var calculatedTimeMinutes = (estimatedTime - now) / (1000 * 60);

                    if (calculatedTimeMinutes < 20) // 20 min
                    {
                        span.innerText = parseInt(calculatedTimeMinutes).toString() + " min (" + result.delay[index].estimatedTime + ")";
                    }
                    else {
                        span.innerText = result.delay[index].estimatedTime;
                    }
                    th.appendChild(span);
                }

                div2.appendChild(tb3);
                table.appendChild(div2);

                // Creating NEWS
                $.getJSON("https://files.xyzgcm.pl/f/xml/bsk.json", function (result) {
                    if (typeof result.error !== 'undefined') {
                        console.log(result.error);
                    }
                    else {
                        if (result.komunikaty.length != 0)
                            table.innerHTML += "<div id=\"news\"></div>";
                        for (let index = 0; index < result.komunikaty.length; index++) {
                            news = document.getElementById("news");
                            news.innerHTML += result.komunikaty[index].tytul + "\n" + result.komunikaty[index].tresc;
                        }
                    }
                });

                // Creating SCROLLER
                table.innerHTML += "<div id=\"scroller\"></div>";

                $.getJSON("https://ckan2.multimediagdansk.pl/displayMessages", function (result) {
                    if (typeof result.error !== 'undefined') {
                        console.log(result.error);
                    }
                    else {
                        for (let index = 0; index < result.displaysMsg.length; index++) {
                            if (result.displaysMsg[index].displayCode == displayCode) {
                                scroller = document.getElementById("scroller");
                                p = document.createElement('p');
                                p.id = "scroller_content";
                                p.innerText = result.displaysMsg[index].messagePart1 + result.displaysMsg[index].messagePart2;
                                if (result.displaysMsg[index].msgType == 1) {
                                    p.style.color = "red";
                                }
                                scroller.appendChild(p);
                            }
                        }
                    }
                });
            }
        });
    }
};