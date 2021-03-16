/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const MARGINS = { TOP: 10, BOTTOM:100, LEFT:100, RIGHT: 100}
const HEIGHT = 600 - MARGINS.TOP - MARGINS.BOTTOM
const WIDTH = 1000 - MARGINS.LEFT - MARGINS.RIGHT

const svg = d3.select('#chart-area').append("svg")
	.attr("height", HEIGHT + MARGINS.TOP + MARGINS.BOTTOM)
	.attr("width", WIDTH + MARGINS.RIGHT + MARGINS.LEFT)

let time = 0

const g = svg.append("g")
	.attr("transform", `translate(${MARGINS.LEFT}, ${MARGINS.TOP})`)

	const x = d3.scaleLog()
	.base(10)
	.domain([142, 150000])
	.range([0, WIDTH])

const y = d3.scaleLinear()
	.domain([0, 90])
	.range([HEIGHT, 0])

const area = d3.scaleLinear()
	.range([25*Math.PI, 1500*Math.PI])
	.domain([2000, 1400000000])

const contcolor = d3.scaleOrdinal(d3.schemePastel1)

// x axis label
const xLabel = g.append("text")
	.attr("class", "x axis label")
	.attr("x", WIDTH / 2)
	.attr("y", HEIGHT + 60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita ($)")

// y axis label
const yLabel = g.append("text")
	.attr("class", "y axis label")
	.attr("y", -40)
	.attr("x", -240)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
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

// Add x axes
const xAxisCall = d3.axisBottom(x)
	.tickValues([400, 4000, 40000])
	.tickFormat(d => d)
g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
	.call(xAxisCall)

// Add y axis
const yAxisCall = d3.axisLeft(y)
g.append("g")
	.attr("class", "y axis")
	.call(yAxisCall)
	

d3.json("data/data.json").then(data =>{
	// clean data
	const formattedData = data.map(year => {
		return year["countries"].filter(country => {
			const dataExists = (country.income && country.life_exp)
			return dataExists
		}).map(country => {
			country.income = Number(country.income)
			country.life_exp = Number(country.life_exp)
			return country
		})
	})
	
		d3.interval(() => {
			time = (time < 214) ? time + 1 : 0
			update(formattedData[time])
		}, 100)

		update(formattedData[0])
})

function update(data) {
	// transition 
	const t = d3.transition()
		.duration(100)

	// Join
	const circles = g.selectAll("circle")
		.data(data, d => d.country)

	// Exit
	circles.exit().remove()
	
	// Enter and merge
	circles.enter().append("circle")
		.attr("fill", d => contcolor(d.continent))
		.merge(circles)
		.transition(t)
			.attr("cy", d => y(d.life_exp))
			.attr("cx", d => x(d.income))
			.attr("r", d => Math.sqrt(area(d.population) / Math.PI))

	
	// update time label 
	timeLabel.text(String(time + 1800))


}