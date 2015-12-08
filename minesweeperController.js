var myApp = angular.module("myApp", ['ui.bootstrap']);

myApp.directive('ngRightClick', function ($parse) {
  return function (scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick);
    element.bind('contextmenu', function (event) {
      scope.$apply(function () {
        event.preventDefault();
        fn(scope, {
          $event: event
        });
      });
    });
  };
});


myApp.controller("MinesweeperController", function ($scope) {
  $scope.minefield = {};

  $scope.numRow = 10;
  $scope.numColumn = 10;
  $scope.numField = $scope.numRow * $scope.numColumn;

  $scope.numMine = 5;

  // status
  $scope.numSigned = 0;
  $scope.numUncovered = 0;
  $scope.result = "";

  $scope.createMinefield = function () {
    $scope.minefield.rows = [];

    for (var i = 0; i < $scope.numRow; i++) {
      var row = {};
      row.spots = [];

      for (var j = 0; j < $scope.numColumn; j++) {
        var spot = {};
        spot.isCovered = true;
        spot.isSigned = false;
        spot.isMine = false;
        spot.row = i;
        spot.column = j;
        spot.numNeighbours = 0;
        row.spots.push(spot);
      }
      $scope.minefield.rows.push(row);
    }
  }


  // Recursively uncover all the empty neighbours
  $scope.unCover = function (spot) {
    if (spot.isSigned) {
      $scope.numSigned--;
    }
    if (spot.isMine) {
      $scope.setCoverAll(false);
      $scope.result = "Loose";
    } else {
      spot.isCovered = false;
      $scope.numUncovered++;

      if (spot.numNeighbours == 0) {
        var nUL, nU, nUR, nL, nL, nDL, nD, nDR;

        nUl = $scope.getSpot(spot.row - 1, spot.column - 1);
        if (nUl && nUl.isCovered && (nUl.numNeighbours == 0)) $scope.unCover(nUl);

        nU = $scope.getSpot(spot.row - 1, spot.column);
        if (nU && nU.isCovered && (nU.numNeighbours == 0)) $scope.unCover(nU);

        nUr = $scope.getSpot(spot.row - 1, spot.column + 1);
        if (nUr && nUr.isCovered && (nUr.numNeighbours == 0)) $scope.unCover(nUr);

        nL = $scope.getSpot(spot.row, spot.column - 1);
        if (nL && nL.isCovered && (nL.numNeighbours == 0)) $scope.unCover(nL);

        nR = $scope.getSpot(spot.row, spot.column + 1);
        if (nR && nR.isCovered && (nR.numNeighbours == 0)) $scope.unCover(nR);

        nDl = $scope.getSpot(spot.row + 1, spot.column - 1);
        if (nDl && nDl.isCovered && (nDl.numNeighbours == 0)) $scope.unCover(nDl);

        nD = $scope.getSpot(spot.row + 1, spot.column);
        if (nD && nD.isCovered && (nD.numNeighbours == 0)) $scope.unCover(nD);

        nDr = $scope.getSpot(spot.row + 1, spot.column + 1);
        if (nDr && nDr.isCovered && (nDr.numNeighbours == 0)) $scope.unCover(nDr);
      }

    }
    if ($scope.numUncovered + $scope.numMine == $scope.numField) {
      $scope.setCoverAll(false);
      $scope.result = "Win";
    }

  }

  $scope.changeSign = function (spot) {
    if (spot.isCovered) {
      if (spot.isSigned) {
        spot.isSigned = false;
        $scope.numSigned--;
      } else {
        spot.isSigned = true;
        $scope.numSigned++;
      }
    }
  }

  $scope.getSpot = function (row, column) {
    if (row >= 0 && row < $scope.numRow && column >= 0 && column < $scope.numColumn) {
      return $scope.minefield.rows[row].spots[column];
    } else {
      return false;
    }
  }


  $scope.getRandomSpot = function () {
    var row = Math.round(Math.random() * ($scope.numRow - 1));
    var column = Math.round(Math.random() * ($scope.numColumn - 1));
    return $scope.getSpot(row, column);
  }


  $scope.placeRandomMines = function () {
    var spot;
    for (var i = 0; i < $scope.numMine;) {
      spot = $scope.getRandomSpot();
      if (!spot.isMine) {
        spot.isMine = true;
        i++;
      }
    }
  }


  $scope.checkMine = function (row, column) {
    var spot = $scope.getSpot(row, column);
    return (spot && spot.isMine);
  }


  $scope.getNeighbourMines = function (row, column) {
    var numNeighbours = 0;
    if ($scope.checkMine(row - 1, column - 1)) numNeighbours++;
    if ($scope.checkMine(row - 1, column)) numNeighbours++;
    if ($scope.checkMine(row - 1, column + 1)) numNeighbours++;
    if ($scope.checkMine(row, column - 1)) numNeighbours++;
    if ($scope.checkMine(row, column + 1)) numNeighbours++;
    if ($scope.checkMine(row + 1, column - 1)) numNeighbours++;
    if ($scope.checkMine(row + 1, column)) numNeighbours++;
    if ($scope.checkMine(row + 1, column + 1)) numNeighbours++;
    return numNeighbours;
  }


  $scope.calcNeighbours = function () {
    for (var row = 0; row < $scope.numRow; row++) {
      for (var column = 0; column < $scope.numColumn; column++) {
        if (!$scope.checkMine(row, column)) {
          $scope.getSpot(row, column).numNeighbours = $scope.getNeighbourMines(row, column);
        }
      }
    }
  }


  $scope.setCoverAll = function (val) {
    for (var row = 0; row < $scope.numRow; row++) {
      for (var column = 0; column < $scope.numColumn; column++) {
        $scope.getSpot(row, column).isCovered = val;
      }
    }
  }


  $scope.getSpotImg = function (spot) {
    if (spot.isCovered) {
      return spot.isSigned ? "img/flag.png" : "img/covered.png";
    } else {
      if (spot.isMine) {
        return "img/mine.png";
      }
      return "img/number-" + spot.numNeighbours + ".png";
    }
  }


  $scope.setup = function () {
    $scope.numSigned = 0;
    $scope.numUncovered = 0;
    $scope.result = "";

    $scope.createMinefield();
    $scope.placeRandomMines();
    $scope.calcNeighbours();
  }


  $scope.setup();

});