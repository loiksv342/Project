let df;

dfd.readCSV("data.csv").then((fullDf) => {
  df = fullDf;
  const input = document.getElementById("recordsCount");

  function renderTable(recordCount) {
    const count = parseInt(recordCount);

    if (isNaN(count) || count <= 0) {
      document.getElementById("output").innerHTML =
        "<p>Please enter a valid positive number.</p>";
      return;
    }

    if (count > df.shape[0]) {
      document.getElementById("output").innerHTML =
        "<p>There are not that many records in the dataset. Please enter a smaller number.</p>";
      return;
    }

    const limitedDf = df.head(count);
    const tableHtml = dfToTable(limitedDf);
    document.getElementById("output").innerHTML = tableHtml;
  }

  function dfToTable(df) {
    const cols = df.columns;
    const data = df.values;

    let html = '<table class="table table-bordered table-striped"><thead><tr>';
    cols.forEach((col) => {
      html += `<th>${col}</th>`;
    });
    html += "</tr></thead><tbody>";

    data.forEach((row) => {
      html += "<tr>";
      row.forEach((cell) => {
        html += `<td>${cell}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    return html;
  }

  // Początkowo pokaż 5 rekordów, jeśli input pusty
  renderTable(5);

  // Odświeżaj po każdej zmianie w inpucie
  input.addEventListener("input", () => renderTable(input.value));
  console.log(df.column("job_title").toString());
});

document.getElementById("bar-chart").addEventListener("click", () => {
  d3.csv("data.csv")
    .then((data) => {
      // Parsuj salary jako liczby
      data.forEach((d) => {
        d.salary = parseFloat(d.salary);
      });

      // Grupowanie po job_title i liczenie średniej pensji
      const grouped = {};
      data.forEach((d) => {
        if (!grouped[d.job_title]) {
          grouped[d.job_title] = { total: 0, count: 0 };
        }
        grouped[d.job_title].total += d.salary;
        grouped[d.job_title].count += 1;
      });

      const labels = [];
      const averages = [];

      for (let title in grouped) {
        labels.push(title);
        averages.push(grouped[title].total / grouped[title].count);
      }

      // Czyść canvas jeśli był już wykres
      const canvas = document.getElementById("myChart");
      const ctx = canvas.getContext("2d");
      if (window.myBarChart instanceof Chart) {
        window.myBarChart.destroy();
      }

      // Tworzenie wykresu
      window.myBarChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Average Salary",
              data: averages,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [
              {
                ticks: {
                  autoSkip: false,
                  maxRotation: 90,
                  minRotation: 45,
                },
              },
            ],
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: "Salary",
                },
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error loading CSV", error);
    });
});

document.getElementById("line-chart").addEventListener("click", () => {
  d3.csv("data.csv")
    .then((data) => {
      data.forEach((d) => {
        d.salary = parseFloat(d.salary);
      });

      const grouped = {};
      data.forEach((d) => {
        if (!grouped[d.work_year]) {
          grouped[d.work_year] = { total: 0, count: 0 };
        }
        grouped[d.work_year].total += d.salary;
        grouped[d.work_year].count += 1;
      });

      const labels = [];
      const averages = [];

      for (let title in grouped) {
        labels.push(title);
        averages.push(grouped[title].total / grouped[title].count);
      }

      const canvas = document.getElementById("myChart");
      const ctx = canvas.getContext("2d");
      if (window.myBarChart instanceof Chart) {
        window.myBarChart.destroy();
      }

      // Tworzenie wykresu
      window.myBarChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Average Salary",
              data: averages,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [
              {
                ticks: {
                  autoSkip: false,
                  maxRotation: 90,
                  minRotation: 45,
                },
              },
            ],
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: "Salary",
                },
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error loading CSV", error);
    });
});

document.getElementById("pie-chart").addEventListener("click", () => {
  d3.csv("data.csv").then((data) => {
    data.forEach((d) => {
      d.salary = parseFloat(d.salary);
    });

    const grouped = d3.rollups(
      data,
      (v) => ({
        count: v.length,
        averageSalary: d3.mean(v, (d) => d.salary),
      }),
      (d) => d.experience_level
    );

    const total = d3.sum(grouped, ([_, v]) => v.count);

    const percentData = grouped.map(([key, value]) => ({
      experience_level: key,
      percent: +((value.count / total) * 100).toFixed(2),
      average_salary: +value.averageSalary.toFixed(2),
    }));

    // Dane do wykresu
    const labels = percentData.map(
      (d) => `${d.experience_level} (${d.percent}%)`
    );
    const dataValues = percentData.map((d) => d.percent);
    const backgroundColors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75, 192, 192, 0.6)",
    ];

    // Czyść canvas
    const canvas = document.getElementById("myChart");
    const ctx = canvas.getContext("2d");
    if (window.myBarChart instanceof Chart) {
      window.myBarChart.destroy();
    }

    // Rysuj pie chart
    window.myBarChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Percent by Experience Level",
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const index = context.dataIndex;
                const salary = percentData[index].average_salary;
                return `${context.label}: ${
                  context.parsed
                }% — Avg salary: $${salary.toLocaleString()}`;
              },
            },
          },
        },
      },
    });
  });
});

document.getElementById("scatter-chart").addEventListener("click", () => {
  d3.csv("data.csv").then((data) => {
    // Parsowanie danych
    const points = data
      .filter((d) => d.salary && d.work_year)
      .map((d) => ({
        x: +d.work_year,
        y: +parseFloat(d.salary),
      }));

    // Czyść canvas jeśli wcześniej był wykres
    const canvas = document.getElementById("myChart");
    const ctx = canvas.getContext("2d");
    if (window.myBarChart instanceof Chart) {
      window.myBarChart.destroy();
    }

    // Tworzenie scatter plotu
    window.myBarChart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Salary vs Work Year",
            data: points,
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Year: ${
                  context.raw.x
                }, Salary: $${context.raw.y.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Work Year",
            },
            type: "linear",
            ticks: {
              precision: 0,
            },
          },
          y: {
            title: {
              display: true,
              text: "Salary",
            },
            beginAtZero: true,
          },
        },
      },
    });
  });
});
