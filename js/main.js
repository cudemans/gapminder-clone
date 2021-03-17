// Set up margins
const MARGINS = { TOP: 10, BOTTOM: 100, LEFT: 100, RIGHT: 100 }
const HEIGHT = 600 - MARGINS.TOP - MARGINS.BOTTOM
const WIDTH = 1000 - MARGINS.LEFT - MARGINS.RIGHT

// Set up SVG canvas
const svg = d3.select('#chart-area').append("svg")
	.attr("height", HEIGHT + MARGINS.TOP + MARGINS.BOTTOM)
	.attr("width", WIDTH + MARGINS.RIGHT + MARGINS.LEFT)

// Declare global variables
let time = 0
let interval
let formattedData

// Append group element
const g = svg.append("g")
	.attr("transform", `translate(${MARGINS.LEFT}, ${MARGINS.TOP})`)

// Tooltip
const tip = d3.tip()
	.attr("class", "d3-tip")
	.html(d => {
		let text = `<strong>Country:</strong> <span style="color: red; text-transform: capitalize">${d.country}</span><br>`
		text += `<strong>Continent:</strong> <span style="color: red; text-transform: capitalize">${d.continent}</span><br>`
		text += `<strong>Life Expectancy:</strong> <span style="color: red">${d3.format(".2f")(d.life_exp)}</span><br>`
		text += `<strong>GDP Per Capita:</strong> <span style="color: red">${d3.format("$,.0f")(d.income)}</span><br>`
		text += `<strong>Population:</strong> <span style="color: red">${d3.format(",.0f")(d.population)}</span><br>`
		return text
	})
g.call(tip)

// Create scales
const x = d3.scaleLog()
	.base(10)
	.domain([142, 150000])
	.range([0, WIDTH])

const y = d3.scaleLinear()
	.domain([0, 90])
	.range([HEIGHT, 0])

const area = d3.scaleLinear()
	.range([25 * Math.PI, 1500 * Math.PI])
	.domain([2000, 1400000000])

const contcolor = d3.scaleOrdinal(d3.schemeTableau10)

// x axis label
const xLabel = g.append("text")
	.attr("class", "x axis label")
	.attr("x", WIDTH / 2)
	.attr("y", HEIGHT + 60)
	.attr("font-size", "20px")
	.attr("opacity", "0.7")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita ($)")

// y axis label
const yLabel = g.append("text")
	.attr("class", "y axis label")
	.attr("y", -40)
	.attr("x", -240)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("opacity", "0.7")
	.attr("transform", "rotate(-90)")
	.text("Life Expectancy (Years)")

// time label 
const timeLabel = g.append("text")
	.attr("class", "time label")
	.attr("y", HEIGHT - 20)
	.attr("x", WIDTH - 60)
	.attr("font-size", "50px")
	.attr("opacity", "0.5")
	.attr("text-anchor", "middle")
	.text("1800")

// Add x axis
const xAxisCall = d3.axisBottom(x)
	.tickValues([400, 4000, 40000])
	.tickFormat(d => d)
g.append("g")
	.attr("color", "#888")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
	.call(xAxisCall)

// Add y axis
const yAxisCall = d3.axisLeft(y)
.ticks(5)
g.append("g")
	.attr("color", "#888")
	.attr("class", "y axis")
	.call(yAxisCall)

// Create a legend
const continents = ['europe', 'asia', 'americas', 'africa']

const legend = g.append("g")
	.attr("transform", `translate(${WIDTH - 20}, ${HEIGHT - 150})`)

continents.forEach((continent, i) => {
	const legendRow = legend.append("g")
		.attr("transform", `translate(0, ${i * 20})`)

	legendRow.append("rect")
		.attr("height", 10)
		.attr("width", 10)
		.attr("fill", contcolor(continent))

	legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.text(continent)
})

// Read in data and standardize
d3.json("data/data.json").then(data => {
	// clean data
	formattedData = data.map(year => {
		return year["countries"].filter(country => {
			const dataExists = (country.income && country.life_exp)
			return dataExists
		}).map(country => {
			country.income = Number(country.income)
			country.life_exp = Number(country.life_exp)
			return country
		})
	})

	update(formattedData[0])
})

// Create step function
function step() {
	time = (time < 214) ? time + 1 : 0
	update(formattedData[time])
}

// Add play/pause functionality
$("#play-button")
	.on("click", function() {
		const button = $(this)
		if (button.text() === 'Play') {
			button.text("Pause")
			interval = setInterval(step, 100)
		} else {
			button.text("Play")
			clearInterval(interval)
		}
	})

// Add reset functionality 
$("#reset-button")
	.on("click", function(){
		time = 0
		update(formattedData[0])
	})

// Allow visualization to update selected continents even if it is paused 
$("#continent-select")
	.on("change", () =>{
		update(formattedData[time])
	})

$("#date-slider").slider({
	min: 1800,
	max: 2014,
	step: 1,
	slide: (event, ui) => {
		time = ui.value - 1800
		update(formattedData[time])
	}
})

// Create update function
function update(data) {
	// transition 
	const t = d3.transition()
		.duration(100)
		
	// Update selected continents 
	const continent = $("#continent-select").val()

	const filteredData = data.filter(d => {
			if (continent === 'all') return true
			else {
				return d.continent == continent
			
			}
		})

	// Join
	const circles = g.selectAll("circle")
		.data(filteredData, d => d.country)

	// Exit
	circles.exit().remove()

	// Enter and merge
	circles.enter().append("circle")
		.attr("fill", d => contcolor(d.continent))
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.merge(circles)
		.transition(t)
		.attr("cy", d => y(d.life_exp))
		.attr("cx", d => x(d.income))
		.attr("r", d => Math.sqrt(2 * area(d.population) / Math.PI))


	// update time label 
	timeLabel.text(String(time + 1800))

	
	$("#date-slider").slider("value", Number(time + 1800))

}