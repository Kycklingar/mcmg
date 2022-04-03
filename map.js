var map = null

function loadImage(ev)
{
	var file = ev.target.files[0]
	var reader = new FileReader()

	var img = new Image()
	img.onload = function(e) {
		map = new Map(img)
		map.generateChunks()
		map.blockCounts()
		map.drawBlockCounts(BC_SORT_ID)
		document.title = map.height()
	}
	
	reader.onload = function(e) {
		img.src = e.target.result
		
	}
	reader.readAsDataURL(file)
}

function Map(img)
{
	this.chunks = []
	this.img = img

	this.pal = null
	
	this.generateChunks = function(){
		var mapEl = document.getElementById("map")
		removeChildren(mapEl)

		this.pal = new palette(mapPalette)
		let rawPalette = this.pal.rawFullPalette()


		var canvas = document.getElementById("fullmap")
		var ctx = canvas.getContext("2d")

		//canvas.width = img.width
		//canvas.height = img.height
		//ctx.drawImage(img, 0, 0, 128, 128)

		var oc = document.createElement("canvas")
		var octx = oc.getContext("2d")

		canvas.width = 512
		canvas.height = 512
		ctx.drawImage(this.img, 0, 0, 512, 512)

		oc.width = 256
		oc.height = 256
		octx.drawImage(canvas, 0, 0, 256, 256)
		
		canvas.width = 128
		canvas.height = 128
		ctx.drawImage(oc, 0, 0, canvas.width, canvas.height)


		let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

		let newImgData = palettize(ctx, imgData, rawPalette)

		// Split image into chunks
		for(let i = 0; i < 8; i++)
		{
			for(let j = 0; j < 8; j++)
			{
				let nimg = cutImage(newImgData, j, i)
				let chunk = new Chunk(nimg, this.pal)
				chunk.buildBlockData()
				this.chunks.push(chunk)

				mapEl.appendChild(chunk.canvas)
			}
		}
	}

	this.blockCounter = new BlockCounter()

	this.blockCounts = function() {
		let count = 0
		for(let i = 0; i < this.chunks.length; i++)
		{
			let cbcb = this.chunks[i].blockCount.blocks
			for(let j = 0; j < cbcb.length; j++)
			{
				console.log(cbcb[j].count)
				this.blockCounter.add(cbcb[j].block, cbcb[j].count)
				count += cbcb[j].count
			}
		}

		console.log("Count ", count)

	}

	this.drawBlockCounts = function(sort)
	{
		this.blockCounter.sort(sort)

		let sid = document.createElement("span")
		sid.innerText = "Sort by id "
		sid.addEventListener("click", function(e){this.drawBlockCounts(BC_SORT_ID)}.bind(this), false)
		sid.style.cursor = "pointer"

		let scount = document.createElement("span")
		scount.innerText = "Sort by count"
		scount.addEventListener("click", function(e){this.drawBlockCounts(BC_SORT_COUNT)}.bind(this), false)
		scount.style.cursor = "pointer"
		
		let tb = document.createElement("table")
		for(let i = 0; i < this.blockCounter.blocks.length; i++)
		{
			let bcb = this.blockCounter.blocks[i]
			let tr = document.createElement("tr")
			let tdl = document.createElement("td")
			let tdr = document.createElement("td")

			tdl.innerText = bcb.block.id + " " + blockNames[bcb.block.id]
			tdr.innerText = bcb.count
			tr.title = blockDetails[bcb.block.id]

			tr.appendChild(tdl)
			tr.appendChild(tdr)

			tb.appendChild(tr)
		}

		let bce = document.getElementById("block-count")
		removeChildren(bce)
		bce.appendChild(sid)
		bce.appendChild(scount)
		bce.appendChild(tb)
	}

	this.height = function() {
		let highest = 0
		let lowest = 0
		for(let x = 0; x < 8; x++)
		{
			let height = 0
			let blocks = []
			for(let y = 0; y < 8; y++)
			{
				blocs = this.chunks[y * 8 + x].getBlockColumn(x)
				blocks = blocks.concat(blocs)
			}

			for(let i = 0; i < blocks.length; i++)
			{
				height += blocks[i].height
				if(height > highest)
					highest = height
				if(height < lowest)
					lowest = height
			}
			console.log(height)

		}
		console.log("Highest, Lowest: ", highest, lowest)
		console.log("Total height: ", highest - lowest)
		return highest - lowest
	}
}

function cutImage(idata, i, j)
{
	var nidata = new ImageData(16, 16)

	for(let y = 0; y < 16; y++)
	{
		for(let x = 0; x < 16; x++)
		{
			let index = i * 16 + j * 128 * 16 + y * 128 + x
			let index2 = y * 16 + x

			nidata.data[4 * index2] = idata.data[4 * index]
			nidata.data[4 * index2 + 1] = idata.data[4 * index + 1]
			nidata.data[4 * index2 + 2] = idata.data[4 * index + 2]
			nidata.data[4 * index2 + 3] = idata.data[4 * index + 3]
		}
	}

	return nidata
}

function renderPalette(ctx, palette)
{
	let newImgData = ctx.createImageData(128, 128)
	for(let i = 0; i < palette.length; i++)
	{
		newImgData.data[4 * i] = palette[i][0]
		newImgData.data[4 * i+1] = palette[i][1]
		newImgData.data[4 * i+2] = palette[i][2]
		newImgData.data[4 * i+3] = 255
	}

	return newImgData
}

function palettize(ctx, imgData, palette)
{
	let newImgData = ctx.createImageData(128, 128)
	
	for(let i = 0; i < imgData.data.length; i += 4)
	{
		let pixelColor = [imgData.data[i], imgData.data[i+1], imgData.data[i+2]]
		let newPixelColor = getPaletteColor(pixelColor, palette)

		newImgData.data[i] = newPixelColor[0]
		newImgData.data[i+1] = newPixelColor[1]
		newImgData.data[i+2] = newPixelColor[2]
		newImgData.data[i+3] = 255

		// Dithering

		// quanterror
		let qr = imgData.data[i  ] - newPixelColor[0]
		let qg = imgData.data[i+1] - newPixelColor[1]
		let qb = imgData.data[i+2] - newPixelColor[2]

		// Right
		imgData.data[i + 4    ] += qr * 7 / 16
		imgData.data[i + 4 + 1] += qg * 7 / 16
		imgData.data[i + 4 + 2] += qb * 7 / 16

		// Bottom left
		imgData.data[i + 128 * 4 - 4    ] += qr * 3 / 16
		imgData.data[i + 128 * 4 - 4 + 1] += qg * 3 / 16
		imgData.data[i + 128 * 4 - 4 + 2] += qb * 3 / 16

		// Bottom
		imgData.data[i + 128 * 4    ] += qr * 5 / 16
		imgData.data[i + 128 * 4 + 1] += qg * 5 / 16
		imgData.data[i + 128 * 4 + 2] += qb * 5 / 16

		// Bottom right
		imgData.data[i + 128 * 4 + 4    ] += qr * 1 / 16
		imgData.data[i + 128 * 4 + 4 + 1] += qg * 1 / 16
		imgData.data[i + 128 * 4 + 4 + 2] += qb * 1 / 16
	}

	return newImgData
}
