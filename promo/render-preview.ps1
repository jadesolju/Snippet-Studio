$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outPath = Join-Path $PSScriptRoot 'snippet-studio-preview-16x9.png'
$mascotPath = Join-Path $PSScriptRoot 'jellyfish-mascot.png'
$width = 1600
$height = 900

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-RoundedFill($graphics, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r, [System.Drawing.Color]$color) {
    $path = New-RoundedPath $x $y $w $h $r
    $brush = [System.Drawing.SolidBrush]::new($color)
    $graphics.FillPath($brush, $path)
    $brush.Dispose()
    $path.Dispose()
}

function Draw-Text($graphics, [string]$text, [string]$family, [float]$size, [System.Drawing.FontStyle]$style, [System.Drawing.Color]$color, [float]$x, [float]$y) {
    $font = [System.Drawing.Font]::new($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = [System.Drawing.SolidBrush]::new($color)
    $graphics.DrawString($text, $font, $brush, $x, $y)
    $brush.Dispose()
    $font.Dispose()
}

$canvas = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bgRect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
$bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new($bgRect, [System.Drawing.Color]::FromArgb(255, 253, 251, 255), [System.Drawing.Color]::FromArgb(255, 245, 240, 255), 24)
$g.FillRectangle($bg, $bgRect)
$bg.Dispose()

# Soft ambient shapes
$lavender = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(80, 219, 207, 255))
$pink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(68, 255, 217, 230))
$g.FillEllipse($lavender, 1010, 125, 530, 530)
$g.FillEllipse($pink, 1240, 510, 270, 270)
$lavender.Dispose()
$pink.Dispose()
$ringPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(95, 189, 174, 228), 2)
$g.DrawEllipse($ringPen, 944, 116, 570, 570)
$ringPen.Dispose()

# Framed canvas and corner details
$framePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(130, 222, 214, 236), 2)
$framePath = New-RoundedPath 22 22 1556 856 34
$g.DrawPath($framePen, $framePath)
$framePen.Dispose()
$framePath.Dispose()

# Brand mark
Draw-RoundedFill $g 70 62 54 54 18 ([System.Drawing.Color]::FromArgb(255, 112, 91, 178))
Draw-Text $g 'S' 'Leelawadee UI' 31 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::White) 83 67
Draw-Text $g 'SNIPPET STUDIO' 'Arial' 20 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(255, 58, 49, 82)) 142 68
Draw-Text $g 'A LITTLE LIBRARY FOR BIG IDEAS' 'Arial' 12 ([System.Drawing.FontStyle]::Regular) ([System.Drawing.Color]::FromArgb(255, 123, 111, 148)) 143 95

# Main copy
Draw-RoundedFill $g 72 167 272 38 19 ([System.Drawing.Color]::FromArgb(255, 240, 233, 255))
Draw-Text $g 'FOR RUBII CREATORS' 'Arial' 14 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(255, 104, 82, 166)) 94 176
Draw-Text $g 'โค้ดพร้อมใช้' 'Leelawadee UI' 67 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(255, 48, 42, 71)) 70 229
Draw-Text $g 'ไอเดียพร้อมไปต่อ' 'Leelawadee UI' 60 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(255, 103, 82, 167)) 70 310
Draw-Text $g 'พรีวิวสด ปรับข้อความและสีได้' 'Leelawadee UI' 27 ([System.Drawing.FontStyle]::Regular) ([System.Drawing.Color]::FromArgb(255, 91, 82, 111)) 75 407
Draw-Text $g 'แล้วคัดลอกโค้ดไปใช้ได้ทันที' 'Leelawadee UI' 27 ([System.Drawing.FontStyle]::Regular) ([System.Drawing.Color]::FromArgb(255, 91, 82, 111)) 75 448

# Rubii feature badge
Draw-RoundedFill $g 72 520 539 66 22 ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$badgePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 226, 219, 241), 2)
$badgePath = New-RoundedPath 72 520 539 66 22
$g.DrawPath($badgePen, $badgePath)
$badgePen.Dispose()
$badgePath.Dispose()
Draw-RoundedFill $g 89 536 8 34 4 ([System.Drawing.Color]::FromArgb(255, 232, 150, 188))
Draw-Text $g 'STYLE TAG + REGEX' 'Arial' 18 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(255, 71, 59, 103)) 113 532
Draw-Text $g 'ตั้งค่าให้ใช้กับ Rubii ได้' 'Leelawadee UI' 19 ([System.Drawing.FontStyle]::Regular) ([System.Drawing.Color]::FromArgb(255, 112, 101, 130)) 113 555

# Three quick facts
$cardY = 622
$cardW = 174
$cardH = 102
$cardXs = @(72, 262, 452)
$labels = @(@('50', 'ตัวอย่าง'), @('6', 'รูปแบบโค้ด'), @('LIVE', 'พรีวิวสด'))
for ($i = 0; $i -lt $cardXs.Count; $i++) {
    $cx = $cardXs[$i]
    Draw-RoundedFill $g $cx $cardY $cardW $cardH 20 ([System.Drawing.Color]::FromArgb(205, 255, 255, 255))
    $cp = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(115, 223, 215, 235), 1.5)
    $path = New-RoundedPath $cx $cardY $cardW $cardH 20
    $g.DrawPath($cp, $path)
    $cp.Dispose()
    $path.Dispose()
    $headSize = if ($i -eq 2) { 22 } else { 34 }
    $headStyle = [System.Drawing.FontStyle]::Bold
    Draw-Text $g $labels[$i][0] 'Arial' $headSize $headStyle ([System.Drawing.Color]::FromArgb(255, 103, 82, 167)) ($cx + 18) ($cardY + 15)
    Draw-Text $g $labels[$i][1] 'Leelawadee UI' 17 ([System.Drawing.FontStyle]::Regular) ([System.Drawing.Color]::FromArgb(255, 94, 84, 112)) ($cx + 18) ($cardY + 62)
}

# Call to action
Draw-RoundedFill $g 72 758 309 62 22 ([System.Drawing.Color]::FromArgb(255, 105, 83, 170))
Draw-Text $g 'เปิดคลัง Snippet Studio' 'Leelawadee UI' 22 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::White) 96 773
Draw-Text $g 'snippet-studio-swart.vercel.app' 'Arial' 17 ([System.Drawing.FontStyle]::Regular) ([System.Drawing.Color]::FromArgb(255, 103, 90, 130)) 73 838

# Mascot artwork
$mascot = [System.Drawing.Image]::FromFile($mascotPath)
$g.DrawImage($mascot, [System.Drawing.Rectangle]::new(796, 194, 764, 510))
$mascot.Dispose()

# Tiny sparkle accents around the mascot
$sparkBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(210, 255, 255, 255))
foreach ($dot in @(@(1370, 185, 10), @(1504, 348, 7), @(905, 596, 8), @(1434, 738, 8), @(1080, 765, 6))) {
    $g.FillEllipse($sparkBrush, [float]$dot[0], [float]$dot[1], [float]$dot[2], [float]$dot[2])
}
$sparkBrush.Dispose()

$canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$canvas.Dispose()
Write-Output $outPath
