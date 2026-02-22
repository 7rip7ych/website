<?php
include('config/config.php');

$title = "Almanacka";

$images = [
    "img/calender/january.jpg",
    "img/calender/february.jpg",
    "img/calender/march.jpg",
    "img/calender/april.jpg",
    "img/calender/may.jpg",
    "img/calender/june.jpg",
    "img/calender/july.jpg",
    "img/calender/august.jpg",
    "img/calender/september.jpg",
    "img/calender/october.jpg",
    "img/calender/november.jpg",
    "img/calender/december.jpg",
];

$time = getDateAndTime();
$date = getDateDetails($time["timestamp"]);
$month = getMonthDetails($time["timestamp"]);
$monthContent = "";

$firstDay = getWeekDetails($month["monthStart"])["weekStart"];
$lastDay = getWeekDetails($month["monthEnd"])["weekEnd"];

$nameDays = getNamesByDay();
for ($time = $firstDay; $time <= $lastDay; $time += 60 * 60 * 24) {
    if (date('z', $time) == date('z', $time - 60 * 60 * 24)) {
        continue;
    }
    $details = getDateDetails($time);
    if ($details["dayOfWeek"] == 1) {
        $week = $details["week"];
        $monthContent .= "<tr><td>$week</td>";
    }
    $day = $details["day"];

    $nameDay = $nameDays[$day . "/" . $details["month"]];
    if ($details["month"] == $month["number"]) {
        $monthContent .= "<td><span>$day</span>
        <span>" . $details["dayOfYear"] . "</span>
        <span>" . implode(", ", $nameDay["events"]) . "</span>
        <span>" . implode(", ", $nameDay["names"]) . "</span></td>";
    } else {
        $monthContent .= "<td class='dimmed-day'><span>$day</span></td>";
    }

    if ($details["dayOfWeek"] == 7) {
        $monthContent .= "</tr>";
    }
}


// include('../view/header.php');
?>

<main class="main">
    <h1><?= $title ?></h1>
    
    <article class="article photocal">
        <div class="photocal">
            <img src="<?= $images[$date["month"] - 1] ?>" alt="Month image">
            <h2><?= $month["name"] ?> <?= $date["year"] ?></h2>
            <table class="photocal-days">
                <thead>
                    <tr>
                        <td></td>
                        <th>Måndag</th>
                        <th>Tisdag</th>
                        <th>Onsdag</th>
                        <th>Torsdag</th>
                        <th>Fredag</th>
                        <th>Lördag</th>
                        <th>Söndag</th>
                    </tr>
                    <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                </thead>
                <tbody>
                    <?= $monthContent ?>
                </tbody>
            </table>
            <p>
                <a href="?date=<?= date('Y-m-d', $month["prevMonth"]) ?>" class="left">&lt; <?= date('F', $month["prevMonth"]) ?></a>
                <a href="?date=<?= date('Y-m-d', $month["nextMonth"]) ?>" class="right"><?= date('F', $month["nextMonth"]) ?> &gt;</a>
            </p>
        </div>
    </article>
</main>

<!-- <?php include('../view/footer.php'); -->