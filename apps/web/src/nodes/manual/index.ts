import type { NodeDefinition } from "../types";
import { MANUAL_SCHEMA } from "./schema";
import { runManualNode } from "./runtime";
import { ManualForm } from "./ManualForm";

export const manualNode: NodeDefinition = {
  key: "manual",
  schema: {
    ...MANUAL_SCHEMA,
    formComponent: ManualForm,
  },
  createInitialConfig: () => ({
    mode: "json",
    jsonPayload: `[
  {
    "jobs": [
      {
        "code": 1,
        "message": "",
        "data": null,
        "page": 0,
        "items_per_page": "3",
        "total_items": "2673",
        "jobs": [
          {
            "id": "88930",
            "type": "workflowjobs",
            "hid": "ODg5MzAud29ya2Zsb3dqb2Jz",
            "token": "e20ff1d6fb8436f79ebf1692d4c5fd1a",
            "to_sign_token": "f0EIiCDkcYq89G6Uv1fVZGZ9zCe9Zy5swul8cVDLF_irr7GfsH4vVoIvURJ12Axq7GdQAGEVOlyWXsNXQ6gXsTIiEmuWVT4ZTWu_ISduPimjZPAlaNHijr3rO1efTztMEQkmTxlk-l4BG6YY2eIWbA",
            "status": "0",
            "state": "active",
            "starred": "0",
            "name": "Đăng ký từ Bùi Quang A - 098454545",
            "title": "Họ và tên: Bùi Quang A &middot; Số điện thoại: 098454545 &middot; Nơi ở: Hf Nội &middot; Đảng viên thuộc chi bộ: Hầ Nội &middot; Nơi công tác: Hà Nội &middot; ",
            "content": "",
            "content_short": "Họ và tên&#58; Bùi Quang A &middot; Số điện thoại&#58; 098454545 &middot; Nơi ở&#58; Hf Nội &middot; Đảng viên thuộc chi bộ&#58; Hầ Nội &middot; Nơi công tác&#58; Hà Nội ...",
            "color": "1",
            "cover": "",
            "owners": [],
            "followers": [
              "buichinh"
            ],
            "since": "1762230719",
            "last_update": "1762230719",
            "finish_at": "0",
            "results": [],
            "stage_id": "83838",
            "stage_export": {
              "id": "83838",
              "name": "Tiếp nhận",
              "metatype": "active",
              "workflow_id": "12141",
              "type": "workflowstages"
            },
            "stats": {
              "notes": 0,
              "posts": 1,
              "files": 0,
              "likes": 0
            },
            "user_id": "0",
            "username": "",
            "todos": [],
            "creator_id": "95325",
            "creator_username": "buichinh",
            "deadline": "0",
            "stage_deadline": "0",
            "stage_start": "1762230719",
            "workflow_id": "12141",
            "workflow_export": {
              "id": "12141",
              "name": "Form khảo sát",
              "type": "workflows"
            },
            "moves": [
              {
                "id": "313382",
                "user_id": "0",
                "username": "",
                "mover_id": "95325",
                "job_id": "88930",
                "stage_id": "83838",
                "stage_start": 1762230719,
                "stage_deadline": "0",
                "from_stage_id": "0",
                "duration": 0,
                "is_conditional_move": 0,
                "actual_duration": 0,
                "skip_holidays": "0"
              }
            ],
            "acl": {},
            "files": [],
            "form": [
              {
                "id": "ho_va_ten",
                "name": "Họ và tên",
                "value": "Bùi Quang A",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkOTI2NzVfMjcwN18xNzYyMjI1NjU2Iiwibm9kZXMiOlt7ImlkIjoiX3V1aWQzMDE4MF8yMjQxOV8xNzYyMjI1NjU2IiwiZmllbGQiOiIiLCJvcGVyYXRvciI6ImVxdWFsIiwidmFsdWUiOiIiLCJwYXJlbnRfaWQiOiJfdXVpZDkyNjc1XzI3MDdfMTc2MjIyNTY1NiIsInR5cGUiOiJub3JtYWwiLCJmb3JtdWxhIjoiIiwiaW5wdXRfdHlwZSI6InRleHQifV0sImNvbmRpdGlvbiI6ImFuZCIsInBhcmVudF9pZCI6bnVsbH0="
              },
              {
                "id": "so_dien_thoai",
                "name": "Số điện thoại",
                "value": "098454545",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkMTgwNDNfNjI3NDhfMTc2MjIyNTY2NSIsIm5vZGVzIjpbeyJpZCI6Il91dWlkOTgxODdfNDc2OV8xNzYyMjI1NjY1IiwiZmllbGQiOiIiLCJvcGVyYXRvciI6ImVxdWFsIiwidmFsdWUiOiIiLCJwYXJlbnRfaWQiOiJfdXVpZDE4MDQzXzYyNzQ4XzE3NjIyMjU2NjUiLCJ0eXBlIjoibm9ybWFsIiwiZm9ybXVsYSI6IiIsImlucHV0X3R5cGUiOiJ0ZXh0In1dLCJjb25kaXRpb24iOiJhbmQiLCJwYXJlbnRfaWQiOm51bGx9"
              },
              {
                "id": "noi_o",
                "name": "Nơi ở",
                "value": "Hf Nội",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkNDUxNl82OTk1Nl8xNzYyMjI1NjcxIiwibm9kZXMiOlt7ImlkIjoiX3V1aWQ1OTkxMl81NTQ5NF8xNzYyMjI1NjcxIiwiZmllbGQiOiIiLCJvcGVyYXRvciI6ImVxdWFsIiwidmFsdWUiOiIiLCJwYXJlbnRfaWQiOiJfdXVpZDQ1MTZfNjk5NTZfMTc2MjIyNTY3MSIsInR5cGUiOiJub3JtYWwiLCJmb3JtdWxhIjoiIiwiaW5wdXRfdHlwZSI6InRleHQifV0sImNvbmRpdGlvbiI6ImFuZCIsInBhcmVudF9pZCI6bnVsbH0="
              },
              {
                "id": "dang_vien_thuoc_chi_bo",
                "name": "Đảng viên thuộc chi bộ",
                "value": "Hầ Nội",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkNTI3OTlfNzM1OTJfMTc2MjIyNTY3NyIsIm5vZGVzIjpbeyJpZCI6Il91dWlkNTYxNDlfMTEzMThfMTc2MjIyNTY3NyIsImZpZWxkIjoiIiwib3BlcmF0b3IiOiJlcXVhbCIsInZhbHVlIjoiIiwicGFyZW50X2lkIjoiX3V1aWQ1Mjc5OV83MzU5Ml8xNzYyMjI1Njc3IiwidHlwZSI6Im5vcm1hbCIsImZvcm11bGEiOiIiLCJpbnB1dF90eXBlIjoidGV4dCJ9XSwiY29uZGl0aW9uIjoiYW5kIiwicGFyZW50X2lkIjpudWxsfQ=="
              },
              {
                "id": "noi_cong_tac",
                "name": "Nơi công tác",
                "value": "Hà Nội",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkMzM4NjBfMzAwNjBfMTc2MjIyNTY4NyIsIm5vZGVzIjpbeyJpZCI6Il91dWlkNTAzMzBfMzQ3OF8xNzYyMjI1Njg3IiwiZmllbGQiOiIiLCJvcGVyYXRvciI6ImVxdWFsIiwidmFsdWUiOiIiLCJwYXJlbnRfaWQiOiJfdXVpZDMzODYwXzMwMDYwXzE3NjIyMjU2ODciLCJ0eXBlIjoibm9ybWFsIiwiZm9ybXVsYSI6IiIsImlucHV0X3R5cGUiOiJ0ZXh0In1dLCJjb25kaXRpb24iOiJhbmQiLCJwYXJlbnRfaWQiOm51bGx9"
              }
            ],
            "form_origin": [
              {
                "id": "ho_va_ten",
                "name": "Họ và tên",
                "value": "Bùi Quang A",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkOTI2NzVfMjcwN18xNzYyMjI1NjU2Iiwibm9kZXMiOlt7ImlkIjoiX3V1aWQzMDE4MF8yMjQxOV8xNzYyMjI1NjU2IiwiZmllbGQiOiIiLCJvcGVyYXRvciI6ImVxdWFsIiwidmFsdWUiOiIiLCJwYXJlbnRfaWQiOiJfdXVpZDkyNjc1XzI3MDdfMTc2MjIyNTY1NiIsInR5cGUiOiJub3JtYWwiLCJmb3JtdWxhIjoiIiwiaW5wdXRfdHlwZSI6InRleHQifV0sImNvbmRpdGlvbiI6ImFuZCIsInBhcmVudF9pZCI6bnVsbH0="
              },
              {
                "id": "so_dien_thoai",
                "name": "Số điện thoại",
                "value": "098454545",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkMTgwNDNfNjI3NDhfMTc2MjIyNTY2NSIsIm5vZGVzIjpbeyJpZCI6Il91dWlkOTgxODdfNDc2OV8xNzYyMjI1NjY1IiwiZmllbGQiOiIiLCJvcGVyYXRvciI6ImVxdWFsIiwidmFsdWUiOiIiLCJwYXJlbnRfaWQiOiJfdXVpZDE4MDQzXzYyNzQ4XzE3NjIyMjU2NjUiLCJ0eXBlIjoibm9ybWFsIiwiZm9ybXVsYSI6IiIsImlucHV0X3R5cGUiOiJ0ZXh0In1dLCJjb25kaXRpb24iOiJhbmQiLCJwYXJlbnRfaWQiOm51bGx9"
              },
              {
                "id": "noi_o",
                "name": "Nơi ở",
                "value": "Hf Nội",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkNDUxNl82OTk1Nl8xNzYyMjI1NjcxIiwibm9kZXMiOlt7ImlkIjoiX3V1aWQ1OTkxMl81NTQ5NF8xNzYyMjI1NjcxIiwiZmllbGQiOiIiLCJvcGVyYXRvciI6ImVxdWFsIiwidmFsdWUiOiIiLCJwYXJlbnRfaWQiOiJfdXVpZDQ1MTZfNjk5NTZfMTc2MjIyNTY3MSIsInR5cGUiOiJub3JtYWwiLCJmb3JtdWxhIjoiIiwiaW5wdXRfdHlwZSI6InRleHQifV0sImNvbmRpdGlvbiI6ImFuZCIsInBhcmVudF9pZCI6bnVsbH0="
              },
              {
                "id": "dang_vien_thuoc_chi_bo",
                "name": "Đảng viên thuộc chi bộ",
                "value": "Hầ Nội",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkNTI3OTlfNzM1OTJfMTc2MjIyNTY3NyIsIm5vZGVzIjpbeyJpZCI6Il91dWlkNTYxNDlfMTEzMThfMTc2MjIyNTY3NyIsImZpZWxkIjoiIiwib3BlcmF0b3IiOiJlcXVhbCIsInZhbHVlIjoiIiwicGFyZW50X2lkIjoiX3V1aWQ1Mjc5OV83MzU5Ml8xNzYyMjI1Njc3IiwidHlwZSI6Im5vcm1hbCIsImZvcm11bGEiOiIiLCJpbnB1dF90eXBlIjoidGV4dCJ9XSwiY29uZGl0aW9uIjoiYW5kIiwicGFyZW50X2lkIjpudWxsfQ=="
              },
              {
                "id": "noi_cong_tac",
                "name": "Nơi công tác",
                "value": "Hà Nội",
                "type": "text",
                "placeholder": "",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkMzM4NjBfMzAwNjBfMTc2MjIyNTY4NyIsIm5vZGVzIjpbeyJpZCI6Il91dWlkNTAzMzBfMzQ3OF8xNzYyMjI1Njg3IiwiZmllbGQiOiIiLCJvcGVyYXRvciI6ImVxdWFsIiwidmFsdWUiOiIiLCJwYXJlbnRfaWQiOiJfdXVpZDMzODYwXzMwMDYwXzE3NjIyMjU2ODciLCJ0eXBlIjoibm9ybWFsIiwiZm9ybXVsYSI6IiIsImlucHV0X3R5cGUiOiJ0ZXh0In1dLCJjb25kaXRpb24iOiJhbmQiLCJwYXJlbnRfaWQiOm51bGx9"
              }
            ],
            "on_failed": {},
            "counter_value": "0",
            "counter_keywords": "",
            "counter_code": "",
            "tags": [],
            "is_archive": "0",
            "data": {
              "first_assignee": "0",
              "deadline_assign": 0,
              "remind_assign_users": []
            },
            "keyword": "88930Đăng ký từ Bùi Quang A - 098454545Họ và tên: Bùi Quang A &middot; Số điện thoại: 098454545 &middot; Nơi ở: Hf Nội &middot; Đảng viên thuộc chi bộ: Hầ Nội &middot; Nơi công tác: Hà Nội &middot; ",
            "link": "base-workflow://job/88930",
            "deadline_by_timesheet": 0,
            "remind_assign_users": [],
            "deadline_assign": 0,
            "first_assignee": "0",
            "system_id": "2329",
            "logs": []
          },
          {
            "id": "83873",
            "type": "workflowjobs",
            "hid": "ODM4NzMud29ya2Zsb3dqb2Jz",
            "token": "f6d3987cca2eb2f4039271f5ecec3387",
            "to_sign_token": "f0EIiCDkcYq89G6Uv1fVZGUkm0JOPygMUT0Fx8EsvCQtRdZmeDAp6EkjTGXQNa1dsNyzzOO8lLslLTaFFNLPy6na097umRg0c_JjsPsLuQOywat0pkxO0sQzaKesROGMp8IR5D-9vQa6Rz5hrw6whg",
            "status": "0",
            "state": "active",
            "starred": "0",
            "name": "KH A (Copy) (Copy) (Copy)",
            "title": "Chi tiết hàng hóa: [TABLE] &middot; Chi tiết hàng hóa (vận chuyển): [TABLE] &middot; ",
            "content": "",
            "content_short": "Chi tiết hàng hóa: [TABLE] &middot; Chi tiết hàng hóa (vận chuyển): [TABLE] &middot; ",
            "color": "1",
            "cover": "",
            "owners": [],
            "followers": [
              "buichinh",
              "tranthom"
            ],
            "since": "1756353877",
            "last_update": "1756354153",
            "finish_at": "0",
            "results": [],
            "stage_id": "48185",
            "stage_export": {
              "id": "48185",
              "name": "stage 2",
              "metatype": "active",
              "workflow_id": "7212",
              "type": "workflowstages"
            },
            "stats": {
              "notes": 1,
              "posts": 2,
              "files": 0,
              "likes": 0
            },
            "user_id": "95326",
            "username": "tranthom",
            "todos": [],
            "creator_id": "95325",
            "creator_username": "buichinh",
            "deadline": "0",
            "stage_deadline": "0",
            "stage_start": "1756354152",
            "workflow_id": "7212",
            "workflow_export": {
              "id": "7212",
              "name": "CREATE PIPELINE",
              "type": "workflows"
            },
            "moves": [
              {
                "id": "298043",
                "user_id": "95325",
                "username": "buichinh",
                "mover_id": "95325",
                "job_id": "83873",
                "stage_id": "48147",
                "stage_start": 1756353877,
                "stage_deadline": 0,
                "from_stage_id": "0",
                "duration": 0,
                "is_conditional_move": 0,
                "actual_duration": 0,
                "skip_holidays": "0",
                "actual_time_by_duration": 275,
                "past": 1,
                "stage_end": 1756354152
              },
              {
                "id": "298047",
                "user_id": "95326",
                "username": "tranthom",
                "mover_id": "95325",
                "job_id": "83873",
                "stage_id": "48185",
                "stage_start": 1756354152,
                "stage_deadline": 0,
                "from_stage_id": "48147",
                "duration": 0,
                "is_conditional_move": 0,
                "actual_duration": 0,
                "skip_holidays": "0"
              }
            ],
            "acl": {},
            "files": [],
            "form": [
              {
                "id": "chi_tiet_hang_hoa",
                "name": "Chi tiết hàng hóa",
                "value": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl0sWyJleUpwWkNJNklqTTBPVGdpTENKMWMyVnlYMmxrSWpvaU9UVXpNalVpTENKamIyNTBZV2x1WlhKZlpYaHdiM0owSWpwN0ltbGtJam9pTVRNMUlpd2lkWE5sY2w5cFpDSTZJamsxTXpJMUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSXNJbTVoYldVaU9pSklYSFV3TUdVd2JtY2dhRngxTURCbU0yRWlmU3dpZEdsMGJHVWlPaUl5TXpRaUxDSjJZV3h6SWpwYmV5SnBaQ0k2SWw5dVlXMWxJaXdpYm1GdFpTSTZJazFjZFRBd1pUTWdhRngxTURCbE1HNW5JR2hjZFRBd1pqTmhJaXdpZG1Gc2RXVWlPaUl5TXpRaUxDSnRaWFJoZEhsd1pTSTZJblJsZUhRaWZTeDdJbWxrSWpvaVpqSWlMQ0p1WVcxbElqb2lWRngxTURCbFlXNGdhRngxTURCbE1HNW5JaXdpZG1Gc2RXVWlPaUpJWEhVd01HVXdibWNnUWlJc0ltMWxkR0YwZVhCbElqb2lkR1Y0ZENKOVhTd2ljMmx1WTJVaU9pSXhOelUyTXpVeU5qazBJaXdpYkdGemRGOTFjR1JoZEdVaU9pSXhOelUyTXpVeU5qazBJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0o5Iiwia2ciLCIxMDAiLCIyMDAwMCIsIjUgYmFvIl1d",
                "type": "input-table",
                "placeholder": "W3siaWQiOiJfdXVpZDM4MTBfNzgwMDlfMTc1NjM1MTI5NCIsIm5hbWUiOiJUw6puIGjDoG5nIGjDs2EiLCJ0eXBlIjoic2VsZWN0LW1hc3RlciIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6eyJsaW5rZWRfdGFibGUiOiJIw6BuZyBow7NhICgjMTM1KSIsImV4dHJhIjoiYmFzZS10YWJsZTpcL1wvcmVjb3Jkcz90YWJsZV9pZD0xMzUifSwicmVxdWlyZSI6MSwic3VtIjowfSx7ImlkIjoiX3V1aWQ5NDc3N183MDIxXzE3NTYzNTEzNTAiLCJuYW1lIjoiRFZUIiwidHlwZSI6InNlbGVjdCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6WyJrZyJdLCJyZXF1aXJlIjowLCJzdW0iOjB9LHsiaWQiOiJfdXVpZDM4ODA0Xzc0OTU5XzE3NTYzNTEzNTEiLCJuYW1lIjoiU0wiLCJ0eXBlIjoiaW50Iiwid2lkdGgiOiIxMzAiLCJjb250ZW50IjoiIiwicmVxdWlyZSI6MCwic3VtIjoxfSx7ImlkIjoiX3V1aWQzMTAxN185ODg0M18xNzU2MzUxMzYwIiwibmFtZSI6IsSQxqFuIGdpw6EiLCJ0eXBlIjoiaW50Iiwid2lkdGgiOiIxMzAiLCJjb250ZW50IjoiIiwicmVxdWlyZSI6MCwic3VtIjoxfSx7ImlkIjoiX3V1aWQyMzI2OV8zNzMyOF8xNzU2MzUxMzY0IiwibmFtZSI6Ik5vdGUiLCJ0eXBlIjoidGV4dCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6IiIsInJlcXVpcmUiOjAsInN1bSI6MH1d",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkNDAxMDJfNTcxNDlfMTc1NjM1MTI5NSIsIm5vZGVzIjpbeyJpZCI6Il91dWlkNDIwNzVfOTQ0NzdfMTc1NjM1MTI5NSIsImZpZWxkIjoiIiwib3BlcmF0b3IiOiJlcXVhbCIsInZhbHVlIjoiIiwicGFyZW50X2lkIjoiX3V1aWQ0MDEwMl81NzE0OV8xNzU2MzUxMjk1IiwidHlwZSI6Im5vcm1hbCIsImZvcm11bGEiOiIiLCJpbnB1dF90eXBlIjoidGV4dCJ9XSwiY29uZGl0aW9uIjoiYW5kIiwicGFyZW50X2lkIjpudWxsfQ==",
                "display": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl0sWyJleUpwWkNJNklqTTBPVGdpTENKMWMyVnlYMmxrSWpvaU9UVXpNalVpTENKamIyNTBZV2x1WlhKZlpYaHdiM0owSWpwN0ltbGtJam9pTVRNMUlpd2lkWE5sY2w5cFpDSTZJamsxTXpJMUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSXNJbTVoYldVaU9pSklYSFV3TUdVd2JtY2dhRngxTURCbU0yRWlmU3dpZEdsMGJHVWlPaUl5TXpRaUxDSjJZV3h6SWpwYmV5SnBaQ0k2SWw5dVlXMWxJaXdpYm1GdFpTSTZJazFjZFRBd1pUTWdhRngxTURCbE1HNW5JR2hjZFRBd1pqTmhJaXdpZG1Gc2RXVWlPaUl5TXpRaUxDSnRaWFJoZEhsd1pTSTZJblJsZUhRaWZTeDdJbWxrSWpvaVpqSWlMQ0p1WVcxbElqb2lWRngxTURCbFlXNGdhRngxTURCbE1HNW5JaXdpZG1Gc2RXVWlPaUpJWEhVd01HVXdibWNnUWlJc0ltMWxkR0YwZVhCbElqb2lkR1Y0ZENKOVhTd2ljMmx1WTJVaU9pSXhOelUyTXpVeU5qazBJaXdpYkdGemRGOTFjR1JoZEdVaU9pSXhOelUyTXpVeU5qazBJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0o5Iiwia2ciLCIxMDAiLCIyMDAwMCIsIjUgYmFvIl1d"
              },
              {
                "id": "chi_tiet_hang_hoa_van_chuyen",
                "name": "Chi tiết hàng hóa (vận chuyển)",
                "value": "W1siSFx1MDBlMG5nIEEiLCIxMCBiYW8iXSxbIkhcdTAwZTBuZyBBIiwiMTAgYmFvIl0sWyJIXHUwMGUwbmcgQiIsIjUgYmFvIl1d",
                "type": "input-table",
                "placeholder": "W3siaWQiOiJfdXVpZDE2NjgxXzY4MzgzXzE3NTYzNTE4NDIiLCJuYW1lIjoiVMOqbiBow6BuZyBow7NhIiwidHlwZSI6InRleHQiLCJ3aWR0aCI6IjEzMCIsImNvbnRlbnQiOiIiLCJyZXF1aXJlIjowLCJzdW0iOjB9LHsiaWQiOiJjb2xfMTc1NjM1MTg3MTU2MF8zMTI2IiwibmFtZSI6IlPhu5EgbMaw4bujbmciLCJ0eXBlIjoidGV4dCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6IiIsInJlcXVpcmUiOjAsInN1bSI6MH1d",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkMjQyNzRfNzc0NTdfMTc1NjM1MTg0MiIsIm5vZGVzIjpbeyJpZCI6Il91dWlkODAxMDlfNzAxNjdfMTc1NjM1MTg0MiIsImZpZWxkIjoiIiwib3BlcmF0b3IiOiJlcXVhbCIsInZhbHVlIjoiIiwicGFyZW50X2lkIjoiX3V1aWQyNDI3NF83NzQ1N18xNzU2MzUxODQyIiwidHlwZSI6Im5vcm1hbCIsImZvcm11bGEiOiIiLCJpbnB1dF90eXBlIjoidGV4dCJ9XSwiY29uZGl0aW9uIjoiYW5kIiwicGFyZW50X2lkIjpudWxsfQ=="
              }
            ],
            "form_origin": [
              {
                "id": "chi_tiet_hang_hoa",
                "name": "Chi tiết hàng hóa",
                "value": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl0sWyJleUpwWkNJNklqTTBPVGdpTENKMWMyVnlYMmxrSWpvaU9UVXpNalVpTENKamIyNTBZV2x1WlhKZlpYaHdiM0owSWpwN0ltbGtJam9pTVRNMUlpd2lkWE5sY2w5cFpDSTZJamsxTXpJMUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSXNJbTVoYldVaU9pSklYSFV3TUdVd2JtY2dhRngxTURCbU0yRWlmU3dpZEdsMGJHVWlPaUl5TXpRaUxDSjJZV3h6SWpwYmV5SnBaQ0k2SWw5dVlXMWxJaXdpYm1GdFpTSTZJazFjZFRBd1pUTWdhRngxTURCbE1HNW5JR2hjZFRBd1pqTmhJaXdpZG1Gc2RXVWlPaUl5TXpRaUxDSnRaWFJoZEhsd1pTSTZJblJsZUhRaWZTeDdJbWxrSWpvaVpqSWlMQ0p1WVcxbElqb2lWRngxTURCbFlXNGdhRngxTURCbE1HNW5JaXdpZG1Gc2RXVWlPaUpJWEhVd01HVXdibWNnUWlJc0ltMWxkR0YwZVhCbElqb2lkR1Y0ZENKOVhTd2ljMmx1WTJVaU9pSXhOelUyTXpVeU5qazBJaXdpYkdGemRGOTFjR1JoZEdVaU9pSXhOelUyTXpVeU5qazBJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0o5Iiwia2ciLCIxMDAiLCIyMDAwMCIsIjUgYmFvIl1d",
                "type": "input-table",
                "placeholder": "W3siaWQiOiJfdXVpZDM4MTBfNzgwMDlfMTc1NjM1MTI5NCIsIm5hbWUiOiJUw6puIGjDoG5nIGjDs2EiLCJ0eXBlIjoic2VsZWN0LW1hc3RlciIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6eyJsaW5rZWRfdGFibGUiOiJIw6BuZyBow7NhICgjMTM1KSIsImV4dHJhIjoiYmFzZS10YWJsZTpcL1wvcmVjb3Jkcz90YWJsZV9pZD0xMzUifSwicmVxdWlyZSI6MSwic3VtIjowfSx7ImlkIjoiX3V1aWQ5NDc3N183MDIxXzE3NTYzNTEzNTAiLCJuYW1lIjoiRFZUIiwidHlwZSI6InNlbGVjdCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6WyJrZyJdLCJyZXF1aXJlIjowLCJzdW0iOjB9LHsiaWQiOiJfdXVpZDM4ODA0Xzc0OTU5XzE3NTYzNTEzNTEiLCJuYW1lIjoiU0wiLCJ0eXBlIjoiaW50Iiwid2lkdGgiOiIxMzAiLCJjb250ZW50IjoiIiwicmVxdWlyZSI6MCwic3VtIjoxfSx7ImlkIjoiX3V1aWQzMTAxN185ODg0M18xNzU2MzUxMzYwIiwibmFtZSI6IsSQxqFuIGdpw6EiLCJ0eXBlIjoiaW50Iiwid2lkdGgiOiIxMzAiLCJjb250ZW50IjoiIiwicmVxdWlyZSI6MCwic3VtIjoxfSx7ImlkIjoiX3V1aWQyMzI2OV8zNzMyOF8xNzU2MzUxMzY0IiwibmFtZSI6Ik5vdGUiLCJ0eXBlIjoidGV4dCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6IiIsInJlcXVpcmUiOjAsInN1bSI6MH1d",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkNDAxMDJfNTcxNDlfMTc1NjM1MTI5NSIsIm5vZGVzIjpbeyJpZCI6Il91dWlkNDIwNzVfOTQ0NzdfMTc1NjM1MTI5NSIsImZpZWxkIjoiIiwib3BlcmF0b3IiOiJlcXVhbCIsInZhbHVlIjoiIiwicGFyZW50X2lkIjoiX3V1aWQ0MDEwMl81NzE0OV8xNzU2MzUxMjk1IiwidHlwZSI6Im5vcm1hbCIsImZvcm11bGEiOiIiLCJpbnB1dF90eXBlIjoidGV4dCJ9XSwiY29uZGl0aW9uIjoiYW5kIiwicGFyZW50X2lkIjpudWxsfQ==",
                "display": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl0sWyJleUpwWkNJNklqTTBPVGdpTENKMWMyVnlYMmxrSWpvaU9UVXpNalVpTENKamIyNTBZV2x1WlhKZlpYaHdiM0owSWpwN0ltbGtJam9pTVRNMUlpd2lkWE5sY2w5cFpDSTZJamsxTXpJMUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSXNJbTVoYldVaU9pSklYSFV3TUdVd2JtY2dhRngxTURCbU0yRWlmU3dpZEdsMGJHVWlPaUl5TXpRaUxDSjJZV3h6SWpwYmV5SnBaQ0k2SWw5dVlXMWxJaXdpYm1GdFpTSTZJazFjZFRBd1pUTWdhRngxTURCbE1HNW5JR2hjZFRBd1pqTmhJaXdpZG1Gc2RXVWlPaUl5TXpRaUxDSnRaWFJoZEhsd1pTSTZJblJsZUhRaWZTeDdJbWxrSWpvaVpqSWlMQ0p1WVcxbElqb2lWRngxTURCbFlXNGdhRngxTURCbE1HNW5JaXdpZG1Gc2RXVWlPaUpJWEhVd01HVXdibWNnUWlJc0ltMWxkR0YwZVhCbElqb2lkR1Y0ZENKOVhTd2ljMmx1WTJVaU9pSXhOelUyTXpVeU5qazBJaXdpYkdGemRGOTFjR1JoZEdVaU9pSXhOelUyTXpVeU5qazBJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0o5Iiwia2ciLCIxMDAiLCIyMDAwMCIsIjUgYmFvIl1d"
              },
              {
                "id": "chi_tiet_hang_hoa_van_chuyen",
                "name": "Chi tiết hàng hóa (vận chuyển)",
                "value": "W1siSFx1MDBlMG5nIEEiLCIxMCBiYW8iXSxbIkhcdTAwZTBuZyBBIiwiMTAgYmFvIl0sWyJIXHUwMGUwbmcgQiIsIjUgYmFvIl1d",
                "type": "input-table",
                "placeholder": "W3siaWQiOiJfdXVpZDE2NjgxXzY4MzgzXzE3NTYzNTE4NDIiLCJuYW1lIjoiVMOqbiBow6BuZyBow7NhIiwidHlwZSI6InRleHQiLCJ3aWR0aCI6IjEzMCIsImNvbnRlbnQiOiIiLCJyZXF1aXJlIjowLCJzdW0iOjB9LHsiaWQiOiJjb2xfMTc1NjM1MTg3MTU2MF8zMTI2IiwibmFtZSI6IlPhu5EgbMaw4bujbmciLCJ0eXBlIjoidGV4dCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6IiIsInJlcXVpcmUiOjAsInN1bSI6MH1d",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkMjQyNzRfNzc0NTdfMTc1NjM1MTg0MiIsIm5vZGVzIjpbeyJpZCI6Il91dWlkODAxMDlfNzAxNjdfMTc1NjM1MTg0MiIsImZpZWxkIjoiIiwib3BlcmF0b3IiOiJlcXVhbCIsInZhbHVlIjoiIiwicGFyZW50X2lkIjoiX3V1aWQyNDI3NF83NzQ1N18xNzU2MzUxODQyIiwidHlwZSI6Im5vcm1hbCIsImZvcm11bGEiOiIiLCJpbnB1dF90eXBlIjoidGV4dCJ9XSwiY29uZGl0aW9uIjoiYW5kIiwicGFyZW50X2lkIjpudWxsfQ=="
              }
            ],
            "on_failed": {},
            "counter_value": "0",
            "counter_keywords": "",
            "counter_code": "",
            "tags": [],
            "is_archive": "0",
            "data": {
              "first_assignee": "95325",
              "deadline_by_timesheet": 0,
              "files": 0,
              "deadline_assign": 0,
              "remind_assign_users": [],
              "stages_assignee": [
                {
                  "stage_id": "48147",
                  "username": "buichinh",
                  "user_id": "95325"
                }
              ],
              "last_assignee": "95325",
              "posts": 1
            },
            "keyword": "83873KH A (Copy) (Copy) (Copy)tranthomTrần Thị ThơmChi tiết hàng hóa: [TABLE] &middot; Chi tiết hàng hóa (vận chuyển): [TABLE] &middot; ",
            "link": "base-workflow://job/83873",
            "deadline_by_timesheet": 0,
            "remind_assign_users": [],
            "deadline_assign": 0,
            "first_assignee": "95325",
            "system_id": "2329",
            "logs": []
          },
          {
            "id": "83867",
            "type": "workflowjobs",
            "hid": "ODM4Njcud29ya2Zsb3dqb2Jz",
            "token": "827c95b6e558690a6fd95f71052e8500",
            "to_sign_token": "f0EIiCDkcYq89G6Uv1fVZFvYrWebWD9d2f1bnIIrP_wF-G3vhYAonJEesT9j6ELn7ieq2FS9BAVVTSghP7IoNDqjB5F0JV3b25IZNE9SLE9oiGjxOydm3-wVt-NFfUWs2bhhusYXvPl-xX_FRCnc3Q",
            "status": "10",
            "state": "done",
            "starred": "0",
            "name": "KH A (Copy) (Copy)",
            "title": "Chi tiết hàng hóa: [TABLE] &middot; Chi tiết hàng hóa (vận chuyển): [TABLE] &middot; ",
            "content": "",
            "content_short": "Chi tiết hàng hóa: [TABLE] &middot; Chi tiết hàng hóa (vận chuyển): [TABLE] &middot; ",
            "color": "1",
            "cover": "",
            "owners": [],
            "followers": [
              "buichinh",
              "tranthom"
            ],
            "since": "1756352585",
            "last_update": "1756354117",
            "finish_at": "1756354117",
            "results": [],
            "stage_id": "48145",
            "stage_export": {
              "id": "48145",
              "name": "Done",
              "metatype": "done",
              "workflow_id": "7212",
              "type": "workflowstages"
            },
            "stats": {
              "notes": 1,
              "posts": 2,
              "files": 0,
              "likes": 0
            },
            "user_id": "95326",
            "username": "tranthom",
            "todos": [],
            "creator_id": "95325",
            "creator_username": "buichinh",
            "deadline": "0",
            "stage_deadline": "0",
            "stage_start": "1756354117",
            "workflow_id": "7212",
            "workflow_export": {
              "id": "7212",
              "name": "CREATE PIPELINE",
              "type": "workflows"
            },
            "moves": [
              {
                "id": "297995",
                "user_id": "95325",
                "username": "buichinh",
                "mover_id": "95325",
                "job_id": "83867",
                "stage_id": "48147",
                "stage_start": 1756352585,
                "stage_deadline": 0,
                "from_stage_id": "0",
                "duration": 0,
                "is_conditional_move": 0,
                "actual_duration": 0,
                "skip_holidays": "0",
                "actual_time_by_duration": 41,
                "past": 1,
                "stage_end": 1756352626
              },
              {
                "id": "297998",
                "user_id": "95326",
                "username": "tranthom",
                "mover_id": "95325",
                "job_id": "83867",
                "stage_id": "48185",
                "stage_start": 1756352626,
                "stage_deadline": 0,
                "from_stage_id": "48147",
                "duration": 0,
                "is_conditional_move": 0,
                "actual_duration": 0,
                "skip_holidays": "0",
                "actual_time_by_duration": 37,
                "past": 1,
                "stage_end": 1756352663
              },
              {
                "id": "298001",
                "user_id": "95325",
                "username": "buichinh",
                "mover_id": "95325",
                "job_id": "83867",
                "stage_id": "48147",
                "stage_start": 1756352663,
                "stage_deadline": 0,
                "from_stage_id": "48185",
                "duration": 0,
                "is_conditional_move": 0,
                "actual_duration": 0,
                "skip_holidays": "0",
                "actual_time_by_duration": 57,
                "past": 1,
                "stage_end": 1756352720
              },
              {
                "id": "298003",
                "user_id": "95326",
                "username": "tranthom",
                "mover_id": "95325",
                "job_id": "83867",
                "stage_id": "48185",
                "stage_start": 1756352720,
                "stage_deadline": 0,
                "from_stage_id": "48147",
                "duration": 0,
                "is_conditional_move": 0,
                "actual_duration": 0,
                "skip_holidays": "0",
                "actual_time_by_duration": 1397,
                "past": 1,
                "stage_end": 1756354117
              },
              {
                "id": "298044",
                "user_id": "95326",
                "username": "tranthom",
                "mover_id": "95326",
                "job_id": "83867",
                "stage_id": "48145",
                "stage_start": 1756354117,
                "stage_deadline": "0",
                "from_stage_id": "48185",
                "duration": 0,
                "is_conditional_move": 0,
                "actual_duration": 0,
                "skip_holidays": "0"
              }
            ],
            "acl": {},
            "files": [],
            "form": [
              {
                "id": "chi_tiet_hang_hoa",
                "value": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl0sWyJleUpwWkNJNklqTTBPVGdpTENKMWMyVnlYMmxrSWpvaU9UVXpNalVpTENKamIyNTBZV2x1WlhKZlpYaHdiM0owSWpwN0ltbGtJam9pTVRNMUlpd2lkWE5sY2w5cFpDSTZJamsxTXpJMUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSXNJbTVoYldVaU9pSklYSFV3TUdVd2JtY2dhRngxTURCbU0yRWlmU3dpZEdsMGJHVWlPaUl5TXpRaUxDSjJZV3h6SWpwYmV5SnBaQ0k2SWw5dVlXMWxJaXdpYm1GdFpTSTZJazFjZFRBd1pUTWdhRngxTURCbE1HNW5JR2hjZFRBd1pqTmhJaXdpZG1Gc2RXVWlPaUl5TXpRaUxDSnRaWFJoZEhsd1pTSTZJblJsZUhRaWZTeDdJbWxrSWpvaVpqSWlMQ0p1WVcxbElqb2lWRngxTURCbFlXNGdhRngxTURCbE1HNW5JaXdpZG1Gc2RXVWlPaUpJWEhVd01HVXdibWNnUWlJc0ltMWxkR0YwZVhCbElqb2lkR1Y0ZENKOVhTd2ljMmx1WTJVaU9pSXhOelUyTXpVeU5qazBJaXdpYkdGemRGOTFjR1JoZEdVaU9pSXhOelUyTXpVeU5qazBJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0o5Iiwia2ciLCIxMDAiLCIyMDAwMCIsIjUgYmFvIl1d",
                "display": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl0sWyJleUpwWkNJNklqTTBPVGdpTENKMWMyVnlYMmxrSWpvaU9UVXpNalVpTENKamIyNTBZV2x1WlhKZlpYaHdiM0owSWpwN0ltbGtJam9pTVRNMUlpd2lkWE5sY2w5cFpDSTZJamsxTXpJMUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSXNJbTVoYldVaU9pSklYSFV3TUdVd2JtY2dhRngxTURCbU0yRWlmU3dpZEdsMGJHVWlPaUl5TXpRaUxDSjJZV3h6SWpwYmV5SnBaQ0k2SWw5dVlXMWxJaXdpYm1GdFpTSTZJazFjZFRBd1pUTWdhRngxTURCbE1HNW5JR2hjZFRBd1pqTmhJaXdpZG1Gc2RXVWlPaUl5TXpRaUxDSnRaWFJoZEhsd1pTSTZJblJsZUhRaWZTeDdJbWxrSWpvaVpqSWlMQ0p1WVcxbElqb2lWRngxTURCbFlXNGdhRngxTURCbE1HNW5JaXdpZG1Gc2RXVWlPaUpJWEhVd01HVXdibWNnUWlJc0ltMWxkR0YwZVhCbElqb2lkR1Y0ZENKOVhTd2ljMmx1WTJVaU9pSXhOelUyTXpVeU5qazBJaXdpYkdGemRGOTFjR1JoZEdVaU9pSXhOelUyTXpVeU5qazBJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0o5Iiwia2ciLCIxMDAiLCIyMDAwMCIsIjUgYmFvIl1d",
                "type": "input-table",
                "name": "Chi tiết hàng hóa",
                "placeholder": "W3siaWQiOiJfdXVpZDM4MTBfNzgwMDlfMTc1NjM1MTI5NCIsIm5hbWUiOiJUw6puIGjDoG5nIGjDs2EiLCJ0eXBlIjoic2VsZWN0LW1hc3RlciIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6eyJsaW5rZWRfdGFibGUiOiJIw6BuZyBow7NhICgjMTM1KSIsImV4dHJhIjoiYmFzZS10YWJsZTpcL1wvcmVjb3Jkcz90YWJsZV9pZD0xMzUifSwicmVxdWlyZSI6MSwic3VtIjowfSx7ImlkIjoiX3V1aWQ5NDc3N183MDIxXzE3NTYzNTEzNTAiLCJuYW1lIjoiRFZUIiwidHlwZSI6InNlbGVjdCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6WyJrZyJdLCJyZXF1aXJlIjowLCJzdW0iOjB9LHsiaWQiOiJfdXVpZDM4ODA0Xzc0OTU5XzE3NTYzNTEzNTEiLCJuYW1lIjoiU0wiLCJ0eXBlIjoiaW50Iiwid2lkdGgiOiIxMzAiLCJjb250ZW50IjoiIiwicmVxdWlyZSI6MCwic3VtIjoxfSx7ImlkIjoiX3V1aWQzMTAxN185ODg0M18xNzU2MzUxMzYwIiwibmFtZSI6IsSQxqFuIGdpw6EiLCJ0eXBlIjoiaW50Iiwid2lkdGgiOiIxMzAiLCJjb250ZW50IjoiIiwicmVxdWlyZSI6MCwic3VtIjoxfSx7ImlkIjoiX3V1aWQyMzI2OV8zNzMyOF8xNzU2MzUxMzY0IiwibmFtZSI6Ik5vdGUiLCJ0eXBlIjoidGV4dCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6IiIsInJlcXVpcmUiOjAsInN1bSI6MH1d",
                "options": []
              },
              {
                "id": "chi_tiet_hang_hoa_van_chuyen",
                "name": "Chi tiết hàng hóa (vận chuyển)",
                "value": "W1siSFx1MDBlMG5nIEEiLCIxMCBiYW8iXSxbIkhcdTAwZTBuZyBBIiwiMTAgYmFvIl0sWyJIXHUwMGUwbmcgQiIsIjUgYmFvIl1d",
                "type": "input-table",
                "placeholder": "W3siaWQiOiJfdXVpZDE2NjgxXzY4MzgzXzE3NTYzNTE4NDIiLCJuYW1lIjoiVMOqbiBow6BuZyBow7NhIiwidHlwZSI6InRleHQiLCJ3aWR0aCI6IjEzMCIsImNvbnRlbnQiOiIiLCJyZXF1aXJlIjowLCJzdW0iOjB9LHsiaWQiOiJjb2xfMTc1NjM1MTg3MTU2MF8zMTI2IiwibmFtZSI6IlPhu5EgbMaw4bujbmciLCJ0eXBlIjoidGV4dCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6IiIsInJlcXVpcmUiOjAsInN1bSI6MH1d",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkMjQyNzRfNzc0NTdfMTc1NjM1MTg0MiIsIm5vZGVzIjpbeyJpZCI6Il91dWlkODAxMDlfNzAxNjdfMTc1NjM1MTg0MiIsImZpZWxkIjoiIiwib3BlcmF0b3IiOiJlcXVhbCIsInZhbHVlIjoiIiwicGFyZW50X2lkIjoiX3V1aWQyNDI3NF83NzQ1N18xNzU2MzUxODQyIiwidHlwZSI6Im5vcm1hbCIsImZvcm11bGEiOiIiLCJpbnB1dF90eXBlIjoidGV4dCJ9XSwiY29uZGl0aW9uIjoiYW5kIiwicGFyZW50X2lkIjpudWxsfQ=="
              }
            ],
            "form_origin": [
              {
                "id": "chi_tiet_hang_hoa",
                "value": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl0sWyJleUpwWkNJNklqTTBPVGdpTENKMWMyVnlYMmxrSWpvaU9UVXpNalVpTENKamIyNTBZV2x1WlhKZlpYaHdiM0owSWpwN0ltbGtJam9pTVRNMUlpd2lkWE5sY2w5cFpDSTZJamsxTXpJMUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSXNJbTVoYldVaU9pSklYSFV3TUdVd2JtY2dhRngxTURCbU0yRWlmU3dpZEdsMGJHVWlPaUl5TXpRaUxDSjJZV3h6SWpwYmV5SnBaQ0k2SWw5dVlXMWxJaXdpYm1GdFpTSTZJazFjZFRBd1pUTWdhRngxTURCbE1HNW5JR2hjZFRBd1pqTmhJaXdpZG1Gc2RXVWlPaUl5TXpRaUxDSnRaWFJoZEhsd1pTSTZJblJsZUhRaWZTeDdJbWxrSWpvaVpqSWlMQ0p1WVcxbElqb2lWRngxTURCbFlXNGdhRngxTURCbE1HNW5JaXdpZG1Gc2RXVWlPaUpJWEhVd01HVXdibWNnUWlJc0ltMWxkR0YwZVhCbElqb2lkR1Y0ZENKOVhTd2ljMmx1WTJVaU9pSXhOelUyTXpVeU5qazBJaXdpYkdGemRGOTFjR1JoZEdVaU9pSXhOelUyTXpVeU5qazBJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0o5Iiwia2ciLCIxMDAiLCIyMDAwMCIsIjUgYmFvIl1d",
                "display": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl0sWyJleUpwWkNJNklqTTBPVGdpTENKMWMyVnlYMmxrSWpvaU9UVXpNalVpTENKamIyNTBZV2x1WlhKZlpYaHdiM0owSWpwN0ltbGtJam9pTVRNMUlpd2lkWE5sY2w5cFpDSTZJamsxTXpJMUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSXNJbTVoYldVaU9pSklYSFV3TUdVd2JtY2dhRngxTURCbU0yRWlmU3dpZEdsMGJHVWlPaUl5TXpRaUxDSjJZV3h6SWpwYmV5SnBaQ0k2SWw5dVlXMWxJaXdpYm1GdFpTSTZJazFjZFRBd1pUTWdhRngxTURCbE1HNW5JR2hjZFRBd1pqTmhJaXdpZG1Gc2RXVWlPaUl5TXpRaUxDSnRaWFJoZEhsd1pTSTZJblJsZUhRaWZTeDdJbWxrSWpvaVpqSWlMQ0p1WVcxbElqb2lWRngxTURCbFlXNGdhRngxTURCbE1HNW5JaXdpZG1Gc2RXVWlPaUpJWEhVd01HVXdibWNnUWlJc0ltMWxkR0YwZVhCbElqb2lkR1Y0ZENKOVhTd2ljMmx1WTJVaU9pSXhOelUyTXpVeU5qazBJaXdpYkdGemRGOTFjR1JoZEdVaU9pSXhOelUyTXpVeU5qazBJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0o5Iiwia2ciLCIxMDAiLCIyMDAwMCIsIjUgYmFvIl1d",
                "type": "input-table",
                "name": "Chi tiết hàng hóa",
                "placeholder": "W3siaWQiOiJfdXVpZDM4MTBfNzgwMDlfMTc1NjM1MTI5NCIsIm5hbWUiOiJUw6puIGjDoG5nIGjDs2EiLCJ0eXBlIjoic2VsZWN0LW1hc3RlciIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6eyJsaW5rZWRfdGFibGUiOiJIw6BuZyBow7NhICgjMTM1KSIsImV4dHJhIjoiYmFzZS10YWJsZTpcL1wvcmVjb3Jkcz90YWJsZV9pZD0xMzUifSwicmVxdWlyZSI6MSwic3VtIjowfSx7ImlkIjoiX3V1aWQ5NDc3N183MDIxXzE3NTYzNTEzNTAiLCJuYW1lIjoiRFZUIiwidHlwZSI6InNlbGVjdCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6WyJrZyJdLCJyZXF1aXJlIjowLCJzdW0iOjB9LHsiaWQiOiJfdXVpZDM4ODA0Xzc0OTU5XzE3NTYzNTEzNTEiLCJuYW1lIjoiU0wiLCJ0eXBlIjoiaW50Iiwid2lkdGgiOiIxMzAiLCJjb250ZW50IjoiIiwicmVxdWlyZSI6MCwic3VtIjoxfSx7ImlkIjoiX3V1aWQzMTAxN185ODg0M18xNzU2MzUxMzYwIiwibmFtZSI6IsSQxqFuIGdpw6EiLCJ0eXBlIjoiaW50Iiwid2lkdGgiOiIxMzAiLCJjb250ZW50IjoiIiwicmVxdWlyZSI6MCwic3VtIjoxfSx7ImlkIjoiX3V1aWQyMzI2OV8zNzMyOF8xNzU2MzUxMzY0IiwibmFtZSI6Ik5vdGUiLCJ0eXBlIjoidGV4dCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6IiIsInJlcXVpcmUiOjAsInN1bSI6MH1d",
                "options": []
              },
              {
                "id": "chi_tiet_hang_hoa_van_chuyen",
                "name": "Chi tiết hàng hóa (vận chuyển)",
                "value": "W1siSFx1MDBlMG5nIEEiLCIxMCBiYW8iXSxbIkhcdTAwZTBuZyBBIiwiMTAgYmFvIl0sWyJIXHUwMGUwbmcgQiIsIjUgYmFvIl1d",
                "type": "input-table",
                "placeholder": "W3siaWQiOiJfdXVpZDE2NjgxXzY4MzgzXzE3NTYzNTE4NDIiLCJuYW1lIjoiVMOqbiBow6BuZyBow7NhIiwidHlwZSI6InRleHQiLCJ3aWR0aCI6IjEzMCIsImNvbnRlbnQiOiIiLCJyZXF1aXJlIjowLCJzdW0iOjB9LHsiaWQiOiJjb2xfMTc1NjM1MTg3MTU2MF8zMTI2IiwibmFtZSI6IlPhu5EgbMaw4bujbmciLCJ0eXBlIjoidGV4dCIsIndpZHRoIjoiMTMwIiwiY29udGVudCI6IiIsInJlcXVpcmUiOjAsInN1bSI6MH1d",
                "required": "0",
                "condition_status": 0,
                "condition_rule": "eyJpZCI6Il91dWlkMjQyNzRfNzc0NTdfMTc1NjM1MTg0MiIsIm5vZGVzIjpbeyJpZCI6Il91dWlkODAxMDlfNzAxNjdfMTc1NjM1MTg0MiIsImZpZWxkIjoiIiwib3BlcmF0b3IiOiJlcXVhbCIsInZhbHVlIjoiIiwicGFyZW50X2lkIjoiX3V1aWQyNDI3NF83NzQ1N18xNzU2MzUxODQyIiwidHlwZSI6Im5vcm1hbCIsImZvcm11bGEiOiIiLCJpbnB1dF90eXBlIjoidGV4dCJ9XSwiY29uZGl0aW9uIjoiYW5kIiwicGFyZW50X2lkIjpudWxsfQ=="
              }
            ],
            "on_failed": {},
            "counter_value": "0",
            "counter_keywords": "",
            "counter_code": "",
            "tags": [],
            "is_archive": "0",
            "data": {
              "first_assignee": "95325",
              "deadline_by_timesheet": 0,
              "files": 0,
              "deadline_assign": 0,
              "remind_assign_users": [],
              "stages_assignee": [
                {
                  "stage_id": "48147",
                  "username": "buichinh",
                  "user_id": "95325"
                },
                {
                  "stage_id": "48185",
                  "username": "tranthom",
                  "user_id": "95326"
                }
              ],
              "last_assignee": "95326",
              "posts": 1
            },
            "keyword": "83867KH A (Copy) (Copy)tranthomTrần Thị ThơmChi tiết hàng hóa: [TABLE] &middot; Chi tiết hàng hóa (vận chuyển): [TABLE] &middot; ",
            "link": "base-workflow://job/83867",
            "deadline_by_timesheet": 0,
            "remind_assign_users": [],
            "deadline_assign": 0,
            "first_assignee": "95325",
            "system_id": "2329",
            "logs": [
              {
                "user_id": "95325",
                "user": null,
                "since": "1756352711",
                "network": null,
                "network_id": null,
                "username": "buichinh",
                "__cached": 0,
                "__deleted": 0,
                "id": "76836",
                "gid": null,
                "origin": null,
                "ns": null,
                "_followers": [],
                "_watchers": [],
                "_assistants": [],
                "_members": [],
                "dbk": null,
                "metatype": "system",
                "collector": "11cc1acbbf5d495b34c43080a2ecc2a6",
                "origin_export": {
                  "id": "83867",
                  "type": "job",
                  "hid": "ODM4Njcud29ya2Zsb3dqb2Jz",
                  "name": "KH A (Copy) (Copy)",
                  "link": "base-workflow://job/83867"
                },
                "title": "",
                "content": "edited custom field <em>Chi tiết hàng hóa</em> of job <em>KH A (Copy) (Copy)</em>",
                "followers": [],
                "data": {
                  "attachment": [
                    {
                      "has_change": 1
                    },
                    {
                      "type": "custom_field",
                      "key": "chi_tiet_hang_hoa",
                      "name": "Chi tiết hàng hóa",
                      "value_old": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl1d",
                      "value_new": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl0sWyJleUpwWkNJNklqTTBPVGdpTENKMWMyVnlYMmxrSWpvaU9UVXpNalVpTENKamIyNTBZV2x1WlhKZlpYaHdiM0owSWpwN0ltbGtJam9pTVRNMUlpd2lkWE5sY2w5cFpDSTZJamsxTXpJMUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSXNJbTVoYldVaU9pSklYSFV3TUdVd2JtY2dhRngxTURCbU0yRWlmU3dpZEdsMGJHVWlPaUl5TXpRaUxDSjJZV3h6SWpwYmV5SnBaQ0k2SWw5dVlXMWxJaXdpYm1GdFpTSTZJazFjZFRBd1pUTWdhRngxTURCbE1HNW5JR2hjZFRBd1pqTmhJaXdpZG1Gc2RXVWlPaUl5TXpRaUxDSnRaWFJoZEhsd1pTSTZJblJsZUhRaWZTeDdJbWxrSWpvaVpqSWlMQ0p1WVcxbElqb2lWRngxTURCbFlXNGdhRngxTURCbE1HNW5JaXdpZG1Gc2RXVWlPaUpJWEhVd01HVXdibWNnUWlJc0ltMWxkR0YwZVhCbElqb2lkR1Y0ZENKOVhTd2ljMmx1WTJVaU9pSXhOelUyTXpVeU5qazBJaXdpYkdGemRGOTFjR1JoZEdVaU9pSXhOelUyTXpVeU5qazBJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0o5Iiwia2ciLCIxMDAiLCIyMDAwMCIsIjUgYmFvIl1d"
                    }
                  ]
                },
                "last_update": "1756352711",
                "status": "1",
                "token": "LFJDFY3GTD83JMNAVAEKCA8WW2G3Z2LV",
                "system_id": "2329",
                "origin_gid": null
              },
              {
                "user_id": "95325",
                "user": null,
                "since": "1756352683",
                "network": null,
                "network_id": null,
                "username": "buichinh",
                "__cached": 0,
                "__deleted": 0,
                "id": "76835",
                "gid": null,
                "origin": null,
                "ns": null,
                "_followers": [],
                "_watchers": [],
                "_assistants": [],
                "_members": [],
                "dbk": null,
                "metatype": "system",
                "collector": "11cc1acbbf5d495b34c43080a2ecc2a6",
                "origin_export": {
                  "id": "83867",
                  "type": "job",
                  "hid": "ODM4Njcud29ya2Zsb3dqb2Jz",
                  "name": "KH A (Copy) (Copy)",
                  "link": "base-workflow://job/83867"
                },
                "title": "",
                "content": "edited custom field <em>Chi tiết hàng hóa</em> of job <em>KH A (Copy) (Copy)</em>",
                "followers": [],
                "data": {
                  "attachment": [
                    {
                      "has_change": 1
                    },
                    {
                      "type": "custom_field",
                      "key": "chi_tiet_hang_hoa",
                      "name": "Chi tiết hàng hóa",
                      "value_old": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXV0=",
                      "value_new": "W1siZXlKcFpDSTZJak0wTnpBaUxDSjFjMlZ5WDJsa0lqb2lPVFV6TWpVaUxDSmpiMjUwWVdsdVpYSmZaWGh3YjNKMElqcDdJbWxrSWpvaU1UTTFJaXdpZFhObGNsOXBaQ0k2SWprMU16STFJaXdpYzNsemRHVnRYMmxrSWpvaU1qTXlPU0lzSW01aGJXVWlPaUpJWEhVd01HVXdibWNnYUZ4MU1EQm1NMkVpZlN3aWRHbDBiR1VpT2lJeE1qTWlMQ0oyWVd4eklqcGJleUpwWkNJNklsOXVZVzFsSWl3aWJtRnRaU0k2SWsxY2RUQXdaVE1nYUZ4MU1EQmxNRzVuSUdoY2RUQXdaak5oSWl3aWRtRnNkV1VpT2lJeE1qTWlMQ0p0WlhSaGRIbHdaU0k2SW5SbGVIUWlmU3g3SW1sa0lqb2laaklpTENKdVlXMWxJam9pVkZ4MU1EQmxZVzRnYUZ4MU1EQmxNRzVuSWl3aWRtRnNkV1VpT2lKSVhIVXdNR1V3Ym1jZ1FTSXNJbTFsZEdGMGVYQmxJam9pZEdWNGRDSjlYU3dpYzJsdVkyVWlPaUl4TnpVMk16VXdNems1SWl3aWJHRnpkRjkxY0dSaGRHVWlPaUl4TnpVMk16VXdNems1SWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NKOSIsImtnIiwiMjUwIiwiMTAwMDAiLCIxMCBiYW8iXSxbImV5SnBaQ0k2SWpNME56QWlMQ0oxYzJWeVgybGtJam9pT1RVek1qVWlMQ0pqYjI1MFlXbHVaWEpmWlhod2IzSjBJanA3SW1sa0lqb2lNVE0xSWl3aWRYTmxjbDlwWkNJNklqazFNekkxSWl3aWMzbHpkR1Z0WDJsa0lqb2lNak15T1NJc0ltNWhiV1VpT2lKSVhIVXdNR1V3Ym1jZ2FGeDFNREJtTTJFaWZTd2lkR2wwYkdVaU9pSXhNak1pTENKMllXeHpJanBiZXlKcFpDSTZJbDl1WVcxbElpd2libUZ0WlNJNklrMWNkVEF3WlRNZ2FGeDFNREJsTUc1bklHaGNkVEF3WmpOaElpd2lkbUZzZFdVaU9pSXhNak1pTENKdFpYUmhkSGx3WlNJNkluUmxlSFFpZlN4N0ltbGtJam9pWmpJaUxDSnVZVzFsSWpvaVZGeDFNREJsWVc0Z2FGeDFNREJsTUc1bklpd2lkbUZzZFdVaU9pSklYSFV3TUdVd2JtY2dRU0lzSW0xbGRHRjBlWEJsSWpvaWRHVjRkQ0o5WFN3aWMybHVZMlVpT2lJeE56VTJNelV3TXprNUlpd2liR0Z6ZEY5MWNHUmhkR1VpT2lJeE56VTJNelV3TXprNUlpd2ljM2x6ZEdWdFgybGtJam9pTWpNeU9TSjkiLCJrZyIsIjI1NSIsIjEwMDAwIiwiMTAgYmFvIl1d"
                    }
                  ]
                },
                "last_update": "1756352683",
                "status": "1",
                "token": "JVQWD3P4M383UASJNPBZHKB4L4DWWW9W",
                "system_id": "2329",
                "origin_gid": null
              }
            ]
          }
        ]
      }
    ]
  }
]`,
    formFields: [
      { fieldName: "users", fieldType: "array", fieldValue: '[{"id":1,"name":"Alice","status":"active"},{"id":2,"name":"Bob","status":"inactive"}]' },
    ],
  }),
  run: runManualNode,
};
