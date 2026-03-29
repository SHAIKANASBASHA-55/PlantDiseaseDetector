import os
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

def train_model():
    print("Setting up paths...")
    dataset_dir = "PlantVillage"  # Expected dataset directory
    img_size = (224, 224)
    batch_size = 32
    num_classes = 117  # 59 plant types, expanded from original 38

    if not os.path.exists(dataset_dir):
        print(f"Error: Dataset directory '{dataset_dir}' not found. Please download PlantVillage dataset.")
        return

    # Data augmentation and loading
    datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        validation_split=0.2
    )

    train_generator = datagen.flow_from_directory(
        dataset_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training'
    )

    val_generator = datagen.flow_from_directory(
        dataset_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation'
    )

    # Base model
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False

    # Add custom top layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(1024, activation='relu')(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    print("Starting training...")
    model.fit(
        train_generator,
        epochs=10,
        validation_data=val_generator
    )

    # Save model
    model_path = os.path.join(os.path.dirname(__file__), "plant_model.h5")
    model.save(model_path)
    print(f"Model saved to {model_path}")

    # Save classes.json
    import json
    classes_dict = {str(v): k for k, v in train_generator.class_indices.items()}
    classes_path = os.path.join(os.path.dirname(__file__), "classes.json")
    with open(classes_path, "w") as f:
        json.dump(classes_dict, f)
    print(f"Classes saved to {classes_path}")

if __name__ == "__main__":
    train_model()
