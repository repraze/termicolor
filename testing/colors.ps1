# Termicolor sample: prints the 16 ANSI colors, backgrounds and text styles for terminal screenshots.
$e = [char]27
"Hello, world - Termicolor terminal test`n"
foreach ($base in 30, 90) { (0..7 | ForEach-Object { "$e[$($base + $_)m $($base + $_) $e[0m" }) -join "" }
""
(0..7 | ForEach-Object { "$e[4$($_)m     $e[0m" }) -join ""
(0..7 | ForEach-Object { "$e[10$($_)m     $e[0m" }) -join ""
"`n$e[2mdim text$e[0m  $e[1mbold text$e[0m  $e[3mitalic$e[0m  $e[4munderline$e[0m  $e[7mreverse$e[0m"
