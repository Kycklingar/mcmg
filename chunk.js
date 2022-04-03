function BlockCount(block, start)
{
	this.block = block
	this.count = start ? start: 1
}

var BC_SORT_ID = 0,
	BC_SORT_COUNT = 1

function BlockCounter()
{
	this.blocks = []

	this.reset = function() {
		this.blocks = []
	}

	this.add = function(block, num) {
		for(let i = 0; i < this.blocks.length; i++)
		{
			if(this.blocks[i].block.id == block.id)
			{
				if(num)
					this.blocks[i].count += num
				else
					this.blocks[i].count++
				return
			}
		}
		this.blocks.push(new BlockCount(block, num))
	}

	this.sort = function(method) {
		if(method == BC_SORT_ID)
			this.blocks.sort(function(a, b){
					return a.block.id > b.block.id
				}
			)
		else
			this.blocks.sort(function(a, b){
					return a.count < b.count
				}
			)
	}
}

function removeChildren(el)
{
	while(el && el.firstChild)
		el.removeChild(el.lastChild)
}

function Chunk(img, pal)
{
	this.blockData = []
	this.blockCount = new BlockCounter()
	
	this.pal = pal
	this.img = img


	this.canvas = document.createElement("canvas")
	this.canvas.width = 16
	this.canvas.height = 16

	this.canvas.addEventListener("click", function(e){this.render()}.bind(this), false)
	this.canvas.style.cursor = "pointer"

	this.ctx = this.canvas.getContext("2d")
	this.ctx.putImageData(this.img, 0, 0)

	this.buildBlockData = function(){
		for(let i = 0; i < this.img.data.length; i += 4)
		{
			for(let j = 0; j < this.pal.blocks.length; j++)
			{
				if(
					this.img.data[i] == this.pal.blocks[j].color[0] &&
					this.img.data[i + 1] == this.pal.blocks[j].color[1] &&
					this.img.data[i + 2] == this.pal.blocks[j].color[2]
				)
				{
					this.blockData.push(this.pal.blocks[j])
					this.blockCount.add(this.pal.blocks[j])
					break
				}
			}
		}

		if(this.blockData.length != 16 * 16)
			console.log("Block data length incorrect: ", this.blockData.length)

		this.blockCount.sort(BC_SORT_COUNT)
	}

	this.getBlockColumn = function(x) {
		var blocks = []
		for(let y = 0; y < 16; y++)
		{
			let block = this.blockData[y * 16 + x]
			blocks.push(block)
		}

		return blocks
	}

	this.render = function(id) {
		let chunkEl = document.getElementById("chunk")
		removeChildren(chunkEl)

		let canvas = document.createElement("canvas")
		let ctx = canvas.getContext("2d")
		canvas.width = 16
		canvas.height = 16

		canvas.addEventListener("click", function(){this.render()}.bind(this), false)
		canvas.style.cursor = "pointer"

		if(id)
		{
			let newImage = ctx.createImageData(16, 16)
			for(let i = 0; i < this.blockData.length; i++)
			{
				let block = this.blockData[i]
				let check = (i % 3 * 4)
				if(block.id == id)
				{
					let c = [20 + check, 120 + check, 220 + check]
					newImage.data[i * 4] =		c[block.height + 1]
					newImage.data[i * 4 + 1] =	c[block.height + 1]
					newImage.data[i * 4 + 2] =	c[block.height + 1]
					newImage.data[i * 4 + 3] =	255
				}
				else
				{
					let c = [60 + check, 110 + check, 230 + check]
					newImage.data[i * 4] =		c[block.height + 1]
					newImage.data[i * 4 + 1] =	25 * (block.height + 1) + check
					newImage.data[i * 4 + 2] =	25 * (block.height + 1) + check
					newImage.data[i * 4 + 3] =	255
				}
			}

			ctx.putImageData(newImage, 0, 0)
		}
		else
		{
			ctx.drawImage(this.canvas, 0, 0)
		}

		chunkEl.appendChild(canvas)

		let a = document.createElement("div")
		a.innerText = "Height Map"
		a.addEventListener("click", function(){this.render(-1)}.bind(this), false)
		a.style.cursor = "pointer"

		let tb = document.createElement("table")
		for(let i = 0; i < this.blockCount.blocks.length; i++)
		{
			let bc = this.blockCount.blocks[i]
			let tr = document.createElement("tr")
			let tdl = document.createElement("td")
			let tdr = document.createElement("td")
			let tdr2 = document.createElement("td")

			tdl.innerText = bc.block.id + " " + blockNames[bc.block.id]
			tdr.innerText = bc.count

			// How many stacks
			let stacks = 0
			let reminder = 0
			for (let i = bc.count; i > 0; i -= 64)
			{
				if (i > 64)
				{
					stacks++
				}
				else
				{
					reminder = i
				}
			}

			tdr2.innerText = "(" + stacks + "+" + reminder + ")"

			tr.title = blockDetails[bc.block.id]
			tr.addEventListener("click", function(){this.render(bc.block.id)}.bind(this), false)
			tr.style.cursor = "pointer"

			tr.appendChild(tdl)
			tr.appendChild(tdr)
			tr.appendChild(tdr2)
			tb.appendChild(tr)
		}

		chunkEl.appendChild(a)
		chunkEl.appendChild(tb)
	}
}
