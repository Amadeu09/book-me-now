import * as ImagePicker from 'expo-image-picker';

/** Obre la galeria i retorna l'URI de la imatge escollida, o null si es cancel·la. */
export async function escollirImatge(quadrada: boolean): Promise<string | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: quadrada,
        aspect: quadrada ? [1, 1] : undefined,
        quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return null;
    return result.assets[0].uri;
}
