(function() {
  var heatmapExample, heatmapSearch, sudoku;
  heatmapExample = new Harry.HeatmapVisualizer;
  heatmapSearch = new Harry.HeatmapSearchVisualizer({
    id: 'examsearchVis'
  });
  sudoku = new Harry.SudokuVisualizer({
    id: 'searchVis'
  });
}).call(this);
