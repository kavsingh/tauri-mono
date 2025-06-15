#[derive(Clone, PartialEq, serde::Serialize, serde::Deserialize, specta::Type)]
pub enum ThemePreference {
	System,
	Dark,
	Light,
}

impl ThemePreference {
	pub fn value(&self) -> &str {
		match *self {
			ThemePreference::Dark => "dark",
			ThemePreference::Light => "light",
			ThemePreference::System => "system",
		}
	}
}

impl PartialEq<tauri::Theme> for ThemePreference {
	fn eq(&self, other: &tauri::Theme) -> bool {
		matches!(
			(self, other),
			(Self::Dark, tauri::Theme::Dark) | (Self::Light, tauri::Theme::Light)
		)
	}
}

impl From<Option<tauri::Theme>> for ThemePreference {
	fn from(val: Option<tauri::Theme>) -> Self {
		match val {
			Some(tauri::Theme::Dark) => Self::Dark,
			Some(tauri::Theme::Light) => Self::Light,
			_ => Self::System,
		}
	}
}

impl From<ThemePreference> for Option<tauri::Theme> {
	fn from(val: ThemePreference) -> Self {
		match val {
			ThemePreference::Dark => Some(tauri::Theme::Dark),
			ThemePreference::Light => Some(tauri::Theme::Light),
			_ => None,
		}
	}
}
