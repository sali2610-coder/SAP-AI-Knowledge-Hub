Attribute VB_Name = "modPM"
Option Explicit

' חיפוש גלובלי - SAP PM. קורא את תיבת החיפוש בדאשבורד, ואם ריקה - שואל ב-InputBox,
' ואז סורק את כל הלשוניות (פרט לדאשבורד) ומקפיץ ללשונית ולשורה הנכונה.
Sub PM_GlobalSearch()
    Dim searchText As String, ws As Worksheet, foundRange As Range
    searchText = CStr(ThisWorkbook.Sheets(1).Range("C21").Value)
    If Trim(searchText) = "" Then
        searchText = InputBox("הזן שדה טכני / טבלה / טרנזקציה / מונח (עברית או אנגלית):", "חיפוש גלובלי - SAP PM")
    End If
    If Trim(searchText) = "" Then Exit Sub
    For Each ws In ThisWorkbook.Worksheets
        If ws.Index > 1 Then                    ' דילוג על מסך הניווט הראשי
            Set foundRange = ws.Cells.Find(What:=searchText, LookIn:=xlValues, _
                                           LookAt:=xlPart, MatchCase:=False)
            If Not foundRange Is Nothing Then
                ws.Activate
                Application.Goto foundRange, True
                foundRange.Interior.Color = RGB(255, 242, 0)
                MsgBox "נמצא בלשונית: " & ws.Name & " | שורה: " & foundRange.Row, vbInformation, "חיפוש הצליח"
                Exit Sub
            End If
        End If
    Next ws
    MsgBox "המונח '" & searchText & "' לא נמצא בקובץ.", vbExclamation, "תוצאת חיפוש"
End Sub

' חזרה למסך הניווט הראשי (הדאשבורד הוא הלשונית הראשונה).
Sub BackToDashboard()
    ThisWorkbook.Sheets(1).Activate
    ThisWorkbook.Sheets(1).Range("A1").Select
End Sub
