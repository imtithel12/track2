fetch('/chart1')
    .then(response => response.json())
    .then(data => {
        const labels = data.map(item => item.event);
        const interactions = data.map(item => item.count);

        const ctx = document.getElementById('chart1').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nombre d\'interactions',
                    data: interactions,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)', // Couleur de fond
                    borderColor: 'rgba(54, 162, 235, 1)', // Couleur de bordure
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Nombre total d\'interactions par type d\'événement', // Titre du graphique
                        font: {
                            size: 16 // Taille de la police du titre
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre d\'interactions' // Titre de l'axe Y
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Type d\'événement' // Titre de l'axe X
                        }
                    }
                }
            }
        });
    });