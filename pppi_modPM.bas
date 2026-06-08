Attribute VB_Name = "modPPPI"
Option Explicit

' SAP PP-PI - global search across all sheets (skips the dashboard).
Sub PPPI_GlobalSearch()
    Dim q As String, ws As Worksheet, f As Range
    q = CStr(ThisWorkbook.Sheets(1).Range("C25").Value)
    If Trim(q) = "" Then q = InputBox("הזן שדה / טבלה / טרנזקציה / מונח:", "PP-PI Global Search")
    If Trim(q) = "" Then Exit Sub
    For Each ws In ThisWorkbook.Worksheets
        If ws.Index > 1 Then
            Set f = ws.Cells.Find(What:=q, LookIn:=xlValues, LookAt:=xlPart, MatchCase:=False)
            If Not f Is Nothing Then
                ws.Activate: Application.Goto f, True
                f.Interior.Color = RGB(255, 242, 0)
                MsgBox "נמצא בלשונית: " & ws.Name & " | שורה: " & f.Row, vbInformation, "חיפוש"
                Exit Sub
            End If
        End If
    Next ws
    MsgBox "לא נמצא: " & q, vbExclamation
End Sub

Sub BackToDashboard()
    ThisWorkbook.Sheets(1).Activate
    ThisWorkbook.Sheets(1).Range("A1").Select
End Sub
