// client/src/components/Pages/QuienesSomos/QuienesSomos.js

import React, { useEffect } from 'react';
import styles from './QuienesSomos.module.css';

function QuienesSomos() {
  useEffect(() => {
    const handleSmoothScroll = (e) => {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, 
          behavior: 'smooth'
        });
      }
    };

    const navLinks = document.querySelectorAll(`.${styles.headerNav} a`);
    navLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });

    return () => {
      navLinks.forEach(link => {
        link.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  return (
    <div className={styles.whoWeAreContainer}>
      {/* Sección del Encabezado (HEADER) - Esta es la parte principal a replicar */}
      <header className={styles.identityHeader}>
        <div className={styles.headerContent}>
          <h2 className={styles.headerSubtitle}>¿QUIÉNES SOMOS?</h2>
          <h1 className={styles.headerTitle}>NUESTRA <span>identidad</span></h1>
        </div>
        {/* Barra de Navegación Interna */}
        <nav className={styles.headerNav}>
          <ul>
            {/* Es crucial que estos 'href' coincidan con los 'id' de las secciones más abajo */}
            <li><a href="#identidad" className={styles.navLink}>NUESTRA IDENTIDAD</a></li>
            <li><a href="#mision-vision" className={styles.navLink}>MISIÓN Y VISIÓN</a></li>
            <li><a href="#nuestras-creencias" className={styles.navLink}>CREENCIAS</a></li>
            <li><a href="#nuestra-comunidad" className={styles.navLink}>COMUNIDAD</a></li>
            <li><a href="#proyecto-proposito" className={styles.navLink}>EL PROYECTO</a></li>
            <li><a href="#invitacion" className={styles.navLink}>INVITACIÓN</a></li>
          </ul>
        </nav>
      </header>

      {/* Contenido Principal de la Página - Donde van tus secciones detalladas */}
      <div className={styles.mainContent}>
        {/* Sección de Bienvenida/Introducción - Le damos un ID para el enlace interno */}
        <section className={styles.section} id="identidad"> {/* <-- ID para el smooth scroll */}
          {/* El título principal de "Quiénes Somos" lo mantendremos aquí abajo, como subtítulo visual */}
          <h2 className={`${styles.mainContentTitle} ${styles.centerText}`}>
            Un Poco Más Sobre Nosotros <i className={`${styles.mainTitleIcon} fas fa-info-circle`}></i>
          </h2>
          <p className={`${styles.paragraph} ${styles.centerText}`}>
            ¡Bienvenido a la página "¿Quiénes Somos?" de la Iglesia Adventista del Séptimo Día Hualqui Central!
            Nos alegra que te intereses en conocernos mejor. Somos una comunidad de fe comprometida con los principios bíblicos y
            el servicio a Dios y a nuestros semejantes.
          </p>
        </section>

        {/* Sección Nuestra Misión y Visión */}
        <section className={styles.section} id="mision-vision"> {/* <-- ID para el smooth scroll */}
          <h2 className={styles.sectionTitle}>
            <i className={`${styles.sectionIcon} fas fa-bullseye`}></i> Nuestra Misión
          </h2>
          <p className={styles.paragraph}>
            Nuestra misión es hacer discípulos de Jesucristo que vivan como Él, proclamen el evangelio eterno a todo el mundo
            y preparen a las personas para el pronto regreso de nuestro Salvador. Buscamos compartir el amor de Dios de manera
            práctica y significativa en nuestra comunidad de Hualqui y más allá.
          </p>
          <h2 className={styles.sectionTitle} style={{marginTop: '30px'}}> {/* Separación visual entre títulos H2 */}
            <i className={`${styles.sectionIcon} fas fa-eye`}></i> Nuestra Visión
          </h2>
          <p className={styles.paragraph}>
            Anhelamos ser una iglesia vibrante y relevante, llena del Espíritu Santo, donde cada miembro experimente un
            crecimiento espiritual continuo, y que a través de nuestra vida y testimonio, el evangelio de Cristo se extienda
            con poder, transformando vidas y haciendo una diferencia positiva en la sociedad.
          </p>
        </section>

        {/* Sección Nuestras Creencias Fundamentales */}
        <section className={styles.section} id="nuestras-creencias"> {/* <-- ID para el smooth scroll */}
          <h2 className={styles.sectionTitle}>
            <i className={`${styles.sectionIcon} fas fa-book-open`}></i> Nuestras Creencias Fundamentales
          </h2>
          <p className={`${styles.paragraph} ${styles.paragraphMarginBottom}`}>
            Como Iglesia Adventista del Séptimo Día, nuestras creencias se basan en la Biblia. Aquí te presentamos algunos de nuestros pilares fundamentales:
          </p>
          <ul className={`${styles.list} ${styles.listSpaced}`}>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-book`}></i>La Biblia como Palabra de Dios:</span> Creemos que la Santa Biblia es la inspirada Palabra de Dios, la única regla de fe y práctica para la vida cristiana.
            </li>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-cross`}></i>La Trinidad:</span> Creemos en un solo Dios, que existe como una unidad de tres personas coeternas: Padre, Hijo (Jesucristo) y Espíritu Santo.
            </li>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-hand-holding-heart`}></i>Jesucristo, nuestro Salvador:</span> Creemos en la divinidad de Jesús, su vida sin pecado, su muerte vicaria en la cruz para la redención de la humanidad, su resurrección y su ministerio como nuestro Abogado en el cielo.
            </li>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-calendar-alt`}></i>El Sábado:</span> Observamos el sábado, el séptimo día de la semana, como un día sagrado de reposo y adoración, instituido por Dios en la creación y ratificado en los Diez Mandamientos.
            </li>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-cloud-sun`}></i>La Segunda Venida de Cristo:</span> Creemos en el pronto y glorioso regreso de Jesucristo a la Tierra para llevar a Su pueblo al cielo y establecer Su reino eterno.
            </li>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-heartbeat`}></i>El Estilo de Vida Saludable:</span> Promovemos un estilo de vida que honre a Dios, incluyendo una dieta saludable (vegetariana), el ejercicio y el cuidado del cuerpo como templo del Espíritu Santo.
            </li>
          </ul>
        </section>

        {/* Sección Nuestra Comunidad */}
        <section className={styles.section} id="nuestra-comunidad"> {/* <-- ID para el smooth scroll */}
          <h2 className={styles.sectionTitle}>
            <i className={`${styles.sectionIcon} fas fa-people-group`}></i> Nuestra Comunidad
          </h2>
          <p className={`${styles.paragraph} ${styles.paragraphMarginBottom}`}>
            Somos más que un grupo de individuos; somos una familia en Cristo. Valoramos el compañerismo, el apoyo mutuo y el servicio activo.
            Participamos en diversas actividades que incluyen:
          </p>
          <ul className={`${styles.list} ${styles.listSpaced}`}>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-hand-holding-heart`}></i>Servicios de Adoración:</span> Momentos de alabanza, oración y estudio de la Biblia cada sábado.
            </li>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-lightbulb`}></i>Estudio Bíblico:</span> Grupos pequeños y clases para profundizar en la Palabra de Dios.
            </li>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-hands-helping`}></i>Programas Comunitarios:</span> Iniciativas para ayudar a los necesitados y mejorar la calidad de vida en Hualqui.
            </li>
            <li>
              <span className={styles.listItemStrong}><i className={`${styles.listItemIcon} fas fa-user-graduate`}></i>Educación Cristiana:</span> Actividades para niños, jóvenes y adultos que fomentan el desarrollo integral.
            </li>
          </ul>
        </section>

        {/* Sección: Información del Proyecto y Propósito */}
        <section className={styles.section} id="proyecto-proposito"> {/* <-- ID para el smooth scroll */}
          <h2 className={styles.sectionTitle}>
            <i className={`${styles.sectionIcon} fas fa-laptop-code`}></i> Información del Proyecto y Propósito de esta Página
          </h2>
          <p className={`${styles.paragraph} ${styles.paragraphMarginBottom}`}>
            Esta página ha sido desarrollada con la dedicación y el esfuerzo de <strong className={styles.boldText}>Dilan Alejandro Baltras Arévalo</strong>, estudiante de Ingeniería en Informática, quien está comprometido con el crecimiento digital de la Iglesia Adventista del Séptimo Día Central de Hualqui. Nuestro objetivo es proporcionar una plataforma accesible y útil para la comunidad, facilitando el acceso a información relevante sobre nuestra fe, actividades y servicios.
          </p>
          <p className={styles.paragraph}>
            El propósito principal de esta sección es ofrecer transparencia sobre el origen y la visión de este proyecto digital. Queremos que los usuarios comprendan que esta iniciativa nace del deseo de servir y conectar, utilizando la tecnología para fortalecer los lazos comunitarios y difundir el mensaje de esperanza. Agradecemos a todos los que han contribuido con su tiempo y talento para hacer realidad esta plataforma.
          </p>
        </section>

        {/* Sección Te Invitamos */}
        <section className={styles.section} id="invitacion"> {/* <-- ID para el smooth scroll */}
          <h2 className={styles.sectionTitle}>
            <i className={`${styles.sectionIcon} fas fa-handshake-angle`}></i> ¡Te Invitamos!
          </h2>
          <p className={`${styles.paragraph} ${styles.centerText}`}>
            Te invitamos a ser parte de nuestra familia. Si buscas un lugar donde crecer espiritualmente, encontrar apoyo y servir a tu comunidad, ¡estás en el lugar correcto! Nos encantaría conocerte y compartir contigo la esperanza y el amor de Jesucristo.
          </p>
          <p className={`${styles.finalInvitation} ${styles.centerText} ${styles.marginTopLarge}`}>
            ¡Esperamos verte pronto en la Iglesia Adventista del Séptimo Día Hualqui Central!
          </p>
        </section>
      </div>
    </div>
  );
}

export default QuienesSomos;