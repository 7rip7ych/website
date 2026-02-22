<?php

/**
 * Various functions for improved code structure.
 */

/**
 * Destroy the session
 */
function destroySession(): void
{
    // Unset variables
    $_SESSION = array();

    // If it's desired to kill the session, also delete the session cookie.
    // This will destroy the session not just the session data.
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }

    // Destroy session
    session_destroy();
}

/**
 * Get the flash message and return it, if exists.
 *
 * @return string with flash message, empty string if no message exists-
 */
function getFlashMessage(): string
{
    $flashMessage = $_SESSION["flash-message"] ?? "";
    unset($_SESSION["flash-message"]);

    return $flashMessage;
}

/**
 * Get time from querystring or todays date.
 * @return array with date and timestamp-
 */
function getDateAndTime(): array
{
    $date = $_GET['date'] ?? date('Y-m-d');
    $res = [];
    $res["timestamp"] = strtotime($date);
    $res["date"] = htmlentities($date);

    return $res;
}


/**
 * Get details about date.
 * @param int representing timestamp.
 * @return array with details.
 */
function getDateDetails($timestamp): array
{
    $res = [];
    $res["day"] = date('j', $timestamp);
    $res["dayName"] = date('D', $timestamp);
    $res["week"] = date('W', $timestamp);
    $res["month"] = date('n', $timestamp);
    $res["year"] = date('Y', $timestamp);

    $res["dayOfYear"] = date('z', $timestamp) + 1;
    $res["dayOfWeek"] = date('N', $timestamp);

    return $res;
}

/**
 * Get details about month.
 *
 * @param int representing timestamp.
 * @return array with details.
 */
function getMonthDetails($timestamp): array
{
    $res = [];
    $res["name"] = date('F', $timestamp);
    $res["number"] = date('n', $timestamp);
    $res["monthLength"] = date('t', $timestamp);

    $res["monthStart"] = $timestamp - (date('j', $timestamp) - 1) * 60 * 60 * 24;
    $res["monthEnd"] = $timestamp + ($res["monthLength"] - date('j', $timestamp)) * 60 * 60 * 24;

    $res["prevMonth"] = $res["monthStart"] - 2 * 60 * 60 * 24;
    $res["nextMonth"] = $res["monthEnd"] + 2 * 60 * 60 * 24;

    return $res;
}

/**
 * Get details about week.
 *
 * @param int representing timestamp.
 * @return array with details.
 */
function getWeekDetails($timestamp): array
{
    $res = [];
    $res["week"] = date('F', $timestamp);
    $res["dayOfWeek"] = date('t', $timestamp);

    $res["weekStart"] = $timestamp - (date('N', $timestamp) - 1) * 60 * 60 * 24;
    $res["weekEnd"] = $timestamp + (7 - date('N', $timestamp)) * 60 * 60 * 24;

    return $res;
}


/**
 * Check if tab is active.
 *
 * @param string link to check.
 * @param string current page controller.
 * @return string with the css class or empty.
 */
function checkController($controller, $currentController): string
{
    $res = '';
    if ($controller == $currentController) {
        $res = 'class="active"';
    }
    return $res;
}

/**
 * Check if array is empty, i.e. all values being null.
 *
 * @param array to check.
 * @return bool whether the array is empty (true) or contains values (false).
 */
function checkArrayIsEmpty($arr): bool
{
    foreach ($arr as $item) {
        if ($item) {
            return false;
        }
    }
    return true;
}
