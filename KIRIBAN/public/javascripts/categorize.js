var elements = document.getElementsByClassName('attachment');

for (var i = 0; i < elements.length; i++) {
	categorize(elements[i]);
}

function categorize(img) {
	var net = new convnetjs.Net();
	net.fromJSON(netObj2);

	var input = convnetjs.img_to_vol(img);
	var output = net.forward(input);
	var w = output.w;

	var name = ["飛行機", "自動車", "鳥", "猫", "鹿", "犬", "カエル", "馬", "船", "トラック"];
	var div = document.createElement('div');
	div.className = "category w-100";

	for (var i = 0; i < w.length; i++) {
		var ratio = w[i] * 100;

		if (ratio >= 1) {
			var row = document.createElement('div');
			row.className = "row w-100";

			var col7 = document.createElement('div');
			col7.className = "col-sm-7";

			var number = document.createElement('div');
			number.className = "bg-primary";
			number.style.width = ratio + "%";
			number.innerText = Math.floor(ratio) + "%";

			col7.appendChild(number);
			row.appendChild(col7);

			var col5 = document.createElement('div');
			col5.className = "col-sm-5";
			col5.innerText = name[i];
			row.appendChild(col5);

			div.appendChild(row);
		}
	}

	img.parentNode.parentNode.insertBefore(div, img.parentNode);
}