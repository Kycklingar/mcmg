var mapPalette = [
	[127, 178, 56],
	[247, 233, 163],
	[199, 199, 199],
	[255, 0, 0],
	[160, 160, 255],
	[167, 167, 167],
	[0, 124, 0],
	[255, 255, 255],
	[164, 168, 184],
	[151, 109, 77],
	[112, 112, 112],
	[64, 64, 255],
	[143, 119, 72],
	[255, 252, 245],
	[216, 127, 51],
	[178, 76, 216],
	[102, 153, 216],
	[229, 229, 51],
	[127, 204, 25],
	[242, 127, 165],
	[76, 76, 76],
	[153, 153, 153],
	[76, 127, 153],
	[127, 63, 178],
	[51, 76, 178],
	[102, 76, 51],
	[102, 127, 51],
	[153, 51, 51],
	[25, 25, 25],
	[250, 238, 77],
	[92, 219, 213],
	[74, 128, 255],
	[0, 217, 58],
	[129, 86, 49],
	[112, 2, 0],
	[209, 177, 161],
	[159, 82, 36],
	[149, 87, 108],
	[112, 108, 138],
	[186, 133, 36],
	[103, 117, 53],
	[160, 77, 78],
	[57, 41, 35],
	[135, 107, 98],
	[87, 92, 92],
	[122, 73, 88],
	[76, 62, 92],
	[76, 50, 35],
	[76, 82, 42],
	[142, 60, 46],
	[37, 22, 16],
	[189, 48, 49],
	[92, 25, 29],
	[22, 126, 134],
	[58, 142, 140],
	[86, 44, 62],
	[20, 180, 133]
]

function block(id, color, height)
{
	this.id = id
	this.color = color
	this.height = height
}

function mul(col, m)
{
	return [
		Math.round(col[0] * m / 255),
		Math.round(col[1] * m / 255),
		Math.round(col[2] * m / 255)
	]
}

function palette(basePalette)
{
	this.blocks = []
	
	// Create blocks from basePalette
	for(let i = 0; i < basePalette.length; i++)
	{
		if(i == 11)
		{
			this.blocks.push(new block(i+1, basePalette[i], 0))
			continue
		}

		this.blocks.push(new block(i+1, mul(basePalette[i], 180), -1))
		this.blocks.push(new block(i+1, mul(basePalette[i], 220), 0))
		this.blocks.push(new block(i+1, basePalette[i], 1))
	}

	this.rawBasePalette = function() {
		let rawPalette = []

		for(let i = 0; i < this.blocks.length; i++)
		{
			if(this.blocks[i].height == 0)
				rawPalette.push(this.blocks[i].color)
		}

		return rawPalette
	}

	this.rawFullPalette = function() {
		let rawPalette = []
		for(let i = 0; i < this.blocks.length; i++)
		{
			rawPalette.push(this.blocks[i].color)
			//this.rawFullPalette.push(mul(this.rawBasePalette[i], 180))
			//this.rawFullPalette.push(mul(this.rawBasePalette[i], 220))
			//this.rawFullPalette.push(this.rawBasePalette[i])
		}

		return rawPalette
	}
}

//function colorDistance(a, b)
//{
//	return Math.sqrt(
//		Math.pow((a[0] - b[0]) * 0.3, 2) +
//		Math.pow((a[1] - b[1]) * 0.59, 2) +
//		Math.pow((a[2] - b[2]) * 0.11, 2)
//	)
//}

//function colorDistance(a, b)
//{
//	return Math.sqrt(
//		Math.pow(a[0] - b[0], 2) +
//		Math.pow(a[1] - b[1], 2) +
//		Math.pow(a[2] - b[2], 2)
//	)
//}

function colorDistance(a, b)
{
	return	Math.pow(a[0] - b[0], 2) +
		Math.pow(a[1] - b[1], 2) +
		Math.pow(a[2] - b[2], 2)
}

function getPaletteColor(a, palette)
{
	let col = null
	let best = 255000000
	for(i = 0; i < palette.length; i++)
	{
		let dist = colorDistance(
			a,
			palette[i]
		)

		if(dist < best)
		{
			col = palette[i]
			best = dist
		}

	}

	return col
}

function hexColor(color)
{
	return color[0].toString(16) + color[1].toString(16) + color[2].toString(16)
}
